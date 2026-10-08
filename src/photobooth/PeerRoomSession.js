import Peer from "peerjs";
import { roomToPeerId } from "./utils.js";
import { PhotoTransfer } from "./PhotoTransfer.js";
import {
  attachRoomConnection,
  broadcastCountdown,
  broadcastCameraState,
  broadcastPhoto,
  broadcastRoster,
  receiveRoster,
  sendPhotoToMembers,
  sendCameraStates,
} from "./PeerRoomMessaging.js";

export class PeerRoomSession {
  constructor({
    stream,
    onParticipants,
    onStatus,
    onPhoto,
    onCountdown,
    onRoomFull,
    onRoomClosed,
    onConnectionFailed,
  }) {
    this.stream = stream;
    this.onParticipants = onParticipants;
    this.onStatus = onStatus;
    this.onPhoto = onPhoto;
    this.onCountdown = onCountdown;
    this.onRoomFull = onRoomFull;
    this.onRoomClosed = onRoomClosed;
    this.onConnectionFailed = onConnectionFailed;
    this.peer = null;
    this.peerId = null;
    this.roomHostId = null;
    this.isHost = false;
    this.members = [];
    this.cameraStates = new Map();
    this.connections = new Map();
    this.calls = new Map();
    this.remoteStreams = new Map();
    this.joined = false;
    this.joinTimeout = null;
    this.destroyed = false;
    this.photoTransfer = new PhotoTransfer({
      onPhoto,
      onHostPhoto: (photo, sender) => {
        if (this.isHost) sendPhotoToMembers(this, photo, sender);
      },
    });
  }

  startHost(room) {
    this.isHost = true;
    this.peer = new Peer(roomToPeerId(room));
    this.peer.on("open", (id) => {
      this.peerId = id;
      this.roomHostId = id;
      this.members = [id];
      this.cameraStates.set(id, true);
      this.publishParticipants();
      this.onStatus("Your photobooth is ready. Share the room code to invite others.");
    });
    this.peer.on("connection", (connection) => attachRoomConnection(this, connection));
    this.peer.on("call", (call) => this.attachIncomingCall(call));
    this.peer.on("error", (error) => this.handlePeerError(error));
  }

  startGuest() {
    this.joinTimeout = setTimeout(() => {
      this.failJoin(
        "Couldn't reach that room. Check the code and make sure the host's booth is still open. If it is, your network may be blocking the connection.",
      );
    }, 15000);
    this.peer = new Peer();
    this.peer.on("open", (id) => {
      this.peerId = id;
      this.members = [id];
      this.cameraStates.set(id, true);
      this.publishParticipants();
      const connection = this.peer.connect(this.roomHostId);
      attachRoomConnection(this, connection);
      this.onStatus("Joining the photobooth...");
    });
    this.peer.on("call", (call) => this.attachIncomingCall(call));
    this.peer.on("error", (error) => this.handlePeerError(error));
  }

  join(room) {
    this.roomHostId = roomToPeerId(room);
    this.startGuest();
  }

  receiveRoster(peerIds) {
    receiveRoster(this, peerIds);
  }

  markJoined() {
    this.joined = true;
    clearTimeout(this.joinTimeout);
    this.joinTimeout = null;
  }

  failJoin(message) {
    if (this.destroyed || this.joined) return;
    clearTimeout(this.joinTimeout);
    this.joinTimeout = null;
    this.onConnectionFailed(message);
  }

  connectMembers() {
    if (!this.peerId || !this.peer || this.peer.destroyed) return;
    for (const memberId of this.members) {
      if (memberId === this.peerId || this.calls.has(memberId)) continue;
      if (this.peerId.localeCompare(memberId) < 0) {
        const call = this.peer.call(memberId, this.stream);
        if (call) this.attachCall(call);
      }
    }
  }

  attachIncomingCall(call) {
    if (!this.members.includes(call.peer)) {
      call.close();
      return;
    }
    if (!this.calls.has(call.peer)) this.attachCall(call);
    call.answer(this.stream);
  }

  attachCall(call) {
    this.calls.set(call.peer, call);
    call.on("stream", (stream) => {
      this.remoteStreams.set(call.peer, stream);
      this.publishParticipants();
      this.onStatus("Participants are connected. Ready for a photo.");
    });
    call.on("close", () => this.removeCall(call.peer));
    call.on("error", () => this.removeCall(call.peer));
  }

  publishParticipants() {
    this.onParticipants(
      this.members.map((peerId, index) => ({
        id: peerId,
        label: peerId === this.peerId
          ? "You"
          : peerId === this.roomHostId
            ? "Host"
            : `Guest ${Math.max(index, 1)}`,
        local: peerId === this.peerId,
        cameraEnabled: this.cameraStates.get(peerId) ?? true,
        stream: peerId === this.peerId ? this.stream : this.remoteStreams.get(peerId) || null,
      })),
    );
  }

  setCameraEnabled(enabled) {
    if (!this.peerId) return;
    this.cameraStates.set(this.peerId, enabled);
    this.publishParticipants();
    if (this.isHost) {
      broadcastCameraState(this, this.peerId, enabled);
      return;
    }
    const hostConnection = this.connections.get(this.roomHostId);
    if (hostConnection?.open) {
      hostConnection.send({ type: "camera-state", enabled });
    }
  }

  removeCall(peerId) {
    this.calls.delete(peerId);
    this.remoteStreams.delete(peerId);
    this.publishParticipants();
  }

  removeMember(peerId) {
    if (peerId === this.peerId || !this.members.includes(peerId)) return;
    this.members = this.members.filter((id) => id !== peerId);
    this.connections.delete(peerId);
    this.cameraStates.delete(peerId);
    this.calls.get(peerId)?.close();
    this.removeCall(peerId);
    if (this.isHost) {
      broadcastRoster(this);
      this.connectMembers();
    }
  }

  handlePeerError(error) {
    const message = {
      "unavailable-id": "That room code is already in use. Try creating another room.",
      "peer-unavailable": "Couldn't find that room. Check the code and make sure the host's booth is still open.",
      network: "Couldn't connect to the room service. Check your internet connection and try again.",
      "server-error": "The room service had a problem. Please try again in a moment.",
      "socket-error": "Couldn't connect to the room service. Check your internet connection and try again.",
      webrtc: "The direct connection failed. Your network may be blocking WebRTC; try another network.",
    }[error.type] || `Connection error: ${error.type}`;

    this.onStatus(message);
    if (error.type === "unavailable-id" || !this.joined) this.failJoin(message);
  }

  broadcastPhoto(photo) {
    broadcastPhoto(this, photo);
  }

  broadcastCountdown(value) {
    broadcastCountdown(this, value);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    clearTimeout(this.joinTimeout);
    this.joinTimeout = null;
    if (this.isHost) {
      for (const connection of this.connections.values()) {
        if (connection.open) connection.send({ type: "room-closed" });
      }
    } else {
      const hostConnection = this.connections.get(this.roomHostId);
      if (hostConnection?.open) hostConnection.send({ type: "leave" });
    }
    for (const call of this.calls.values()) call.close();
    for (const connection of this.connections.values()) connection.close();
    this.peer?.destroy();
    this.stream.getTracks().forEach((track) => track.stop());
    this.connections.clear();
    this.calls.clear();
    this.remoteStreams.clear();
    this.cameraStates.clear();
    this.photoTransfer.clear();
  }
}
