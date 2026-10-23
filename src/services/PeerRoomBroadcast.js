/**
 * Outgoing room messages: roster, camera state, countdowns and photos.
 *
 * Split out of `PeerRoomMessaging` so that file stays the inbound router and
 * below the project's line budget. Every function takes the session first,
 * mirroring the other `PeerRoom*` helpers.
 */
import { PHOTO_SHOT_COUNT } from "../lib/constants.js";

export function sendRoster(session, connection) {
  if (connection.open) connection.send({ type: "roster", peerIds: session.members });
}

export function broadcastRoster(session) {
  for (const connection of session.connections.values()) sendRoster(session, connection);
}

export function broadcastCountdown(session, value, meta = {}) {
  if (!session.isHost) return;
  for (const connection of session.connections.values()) {
    if (session.members.includes(connection.peer) && connection.open) {
      const message = {
        type: "countdown",
        value,
        total: meta.total ?? PHOTO_SHOT_COUNT,
      };
      if (Number.isInteger(meta.shot)) message.shot = meta.shot;
      connection.send(message);
    }
  }
}

export function broadcastCameraState(session, peerId, enabled) {
  if (!session.isHost) return;
  for (const [memberId, connection] of session.connections) {
    if (
      memberId !== peerId &&
      session.members.includes(memberId) &&
      connection.open
    ) {
      connection.send({ type: "camera-state", peerId, enabled });
    }
  }
}

export function sendCameraStates(session, connection) {
  if (!session.isHost || !connection.open) return;
  for (const peerId of session.members) {
    connection.send({
      type: "camera-state",
      peerId,
      enabled: session.cameraStates.get(peerId) ?? true,
    });
  }
}

export function sendPhotoToMembers(session, photo, exceptPeer = null) {
  for (const [peerId, connection] of session.connections) {
    if (
      session.members.includes(peerId) &&
      peerId !== exceptPeer &&
      connection.open
    ) {
      try {
        session.photoTransfer.send(connection, photo);
      } catch (error) {
        console.error(`Could not share the photo with ${peerId}:`, error);
        session.onStatus("Photo saved here, but could not be shared with everyone.");
      }
    }
  }
}

export function broadcastPhoto(session, photo) {
  // A clear dismisses the host's unsaved preview on guests. Only the host can
  // send one; guests ignore another guest's attempt.
  if (photo?.cleared) {
    if (!session.isHost || typeof photo.captureId !== "string") return;
    for (const [peerId, connection] of session.connections) {
      if (session.members.includes(peerId) && connection.open) {
        connection.send({ type: "photo-cleared", captureId: photo.captureId });
      }
    }
    return;
  }
  try {
    if (session.isHost) {
      sendPhotoToMembers(session, photo);
      return;
    }
    const hostConnection = session.connections.get(session.roomHostId);
    if (hostConnection?.open) session.photoTransfer.send(hostConnection, photo);
    else session.onStatus("Photo was captured, but could not be shared with the room.");
  } catch (error) {
    console.error("Could not share the group photo:", error);
    session.onStatus("Photo saved here, but could not be shared with the room.");
  }
}
