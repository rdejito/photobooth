import Peer from "peerjs";
import { roomToPeerId } from "../lib/utils.js";
import { PhotoTransfer } from "./PhotoTransfer.js";
import { attachRoomConnection, receiveRoster } from "./PeerRoomMessaging.js";
import {
  broadcastCountdown,
  broadcastCameraState,
  broadcastPhoto,
  broadcastRoster,
  sendPhotoToMembers,
  sendCameraStates,
} from "./PeerRoomBroadcast.js";
import {
  destroyRoom,
  handlePeerDisconnected,
  markPeerConnected,
  removeMemberFromRoom,
} from "./PeerRoomLifecycle.js";

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
    deviceId = null,
    rejoinToken = null,
    onRejoinToken = null,
  }) {
    this.stream = stream;
    this.onParticipants = onParticipants;
    this.onStatus = onStatus;
    this.onPhoto = onPhoto;
    this.onCountdown = onCountdown;
    this.onRoomFull = onRoomFull;
    this.onRoomClosed = onRoomClosed;
    this.onConnectionFailed = onConnectionFailed;
    this.deviceId = deviceId;
    this.rejoinToken = rejoinToken;
    this.onRejoinToken = onRejoinToken;
    this.peer = null;
    this.peerId = null;
    this.roomHostId = null;
    this.isHost = false;
    this.members = [];
    // Host-only: maps each member's peer id to the stable rejoin id it used.
    this.deviceIds = new Map();
    // Host-only: the credential each guest presents when reclaiming its seat.
    this.rejoinTokens = new Map();
    this.cameraStates = new Map();
    this.connections = new Map();
    this.calls = new Map();
    this.remoteStreams = new Map();
    // Peers whose tile shows "Reconnecting…" during the disconnect grace.
    this.disconnectedPeers = new Set();
    this.disconnectTimers = new Map();
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
    this.attachCall(call);
    call.answer(this.stream);
  }

  attachCall(call) {
    const existingCall = this.calls.get(call.peer);
    if (existingCall && existingCall !== call) existingCall.close();
    this.calls.set(call.peer, call);
    call.on("stream", (stream) => {
      this.remoteStreams.set(call.peer, stream);
      this.markPeerConnected(call.peer);
      this.publishParticipants();
    });
    // `close` is the authoritative teardown signal: PeerJS follows every
    // MediaConnection `error` with `close` (see the IceNegotiator), so treating
    // the error itself as a disconnect would only risk acting on a transient
    // negotiation failure. Unhandled `error` events are safe to omit because
    // PeerJS uses eventemitter3, which does not throw on them.
    call.on("close", () => {
      if (this.calls.get(call.peer) !== call) return;
      this.handlePeerDisconnected(call.peer);
    });
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
        connected: peerId === this.peerId || !this.disconnectedPeers.has(peerId),
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
    if (hostConnection?.open) hostConnection.send({ type: "camera-state", enabled });
  }

  removeCall(peerId) {
    this.calls.delete(peerId);
    this.remoteStreams.delete(peerId);
    this.publishParticipants();
  }

  /** Cancels a pending disconnect removal once a peer reconnects. */
  markPeerConnected(peerId) {
    markPeerConnected(this, peerId);
  }

  /** Shows a dropped peer as reconnecting, removing the tile after the grace. */
  handlePeerDisconnected(peerId) {
    handlePeerDisconnected(this, peerId);
  }

  removeMember(peerId) {
    removeMemberFromRoom(this, peerId, broadcastRoster);
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
    if (error.type === "unavailable-id" || (!this.isHost && !this.joined)) this.failJoin(message);
  }

  broadcastPhoto(photo) {
    broadcastPhoto(this, photo);
  }

  broadcastCountdown(value, meta) {
    broadcastCountdown(this, value, meta);
  }

  /**
   * Tears the session down and releases the local camera. Pass
   * `{ unload: true }` when the page is unloading so remote peers show the
   * disconnected status before the roster reflows.
   */
  destroy(options) {
    destroyRoom(this, options);
  }
}
