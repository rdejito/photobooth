import { MAX_PARTICIPANTS, PHOTO_SHOT_COUNT } from "../lib/constants.js";
import { handleGuestJoin } from "./PeerRoomLifecycle.js";

export function attachRoomConnection(session, connection) {
  session.connections.set(connection.peer, connection);
  connection.on("open", () => {
    if (!session.isHost) {
      connection.send({
        type: "join",
        cameraEnabled: session.cameraStates.get(session.peerId) ?? true,
        deviceId: session.deviceId,
      });
    }
  });
  connection.on("data", (message) => handleRoomMessage(session, connection, message));
  connection.on("close", () => {
    if (!session.isHost && !session.joined) {
      session.failJoin(
        "The connection closed before joining. Check the room code and make sure the host's booth is still open.",
      );
    }
    session.handlePeerDisconnected(connection.peer);
  });
  connection.on("error", (error) => {
    if (!session.isHost && !session.joined) {
      const message = error.type === "peer-unavailable"
        ? "Couldn't find that room. Check the code and make sure the host's booth is still open."
        : "Couldn't connect to that room. Check your network and try again.";
      session.failJoin(message);
    }
    session.handlePeerDisconnected(connection.peer);
  });
}

function handleRoomMessage(session, connection, message) {
  if (!message || typeof message !== "object") return;
  if (
    (session.isHost && !session.members.includes(connection.peer) && message.type !== "join") ||
    (!session.isHost && connection.peer !== session.roomHostId)
  ) return;
  if (message.type === "join" && session.isHost) {
    if (handleGuestJoin(session, connection, message)) {
      broadcastRoster(session);
      sendCameraStates(session, connection);
      session.connectMembers();
    }
    return;
  }
  if (message.type === "leave" && session.isHost) {
    session.removeMember(connection.peer);
    return;
  }
  // An unload is a known departure, but the tile still shows the disconnected
  // status for the grace period before the roster reflows.
  if (message.type === "departing" && session.isHost) {
    session.handlePeerDisconnected(connection.peer);
    return;
  }
  if (message.type === "roster" && !session.isHost) {
    session.receiveRoster(message.peerIds || []);
    return;
  }
  if (message.type === "room-full") {
    session.onRoomFull();
    session.onStatus("This room is full. The limit is four participants.");
    return;
  }
  if (message.type === "camera-state") {
    if (typeof message.enabled !== "boolean") return;
    if (session.isHost) {
      session.cameraStates.set(connection.peer, message.enabled);
      session.publishParticipants();
      broadcastCameraState(session, connection.peer, message.enabled);
    } else if (
      connection.peer === session.roomHostId &&
      typeof message.peerId === "string" &&
      session.members.includes(message.peerId)
    ) {
      session.cameraStates.set(message.peerId, message.enabled);
      session.publishParticipants();
    }
    return;
  }
  if (message.type === "photo-start" || message.type === "photo-chunk") {
    session.photoTransfer.receive(connection, message);
    return;
  }
  // Only the host can dismiss a pending preview, and only guests act on it.
  if (message.type === "photo-cleared") {
    if (!session.isHost && typeof message.captureId === "string") {
      session.onPhoto?.({ cleared: true, captureId: message.captureId });
    }
    return;
  }
  if (message.type === "room-closed") {
    session.onStatus("The room creator ended the photobooth.");
    session.onRoomClosed();
    return;
  }
  if (message.type === "countdown" && !session.isHost) {
    const parsed = parseCountdownMessage(message);
    if (parsed) session.onCountdown(parsed.value, parsed.meta);
  }
}

/**
 * Validates a countdown message and normalizes it for the UI layer.
 *
 * The countdown "clear" messages are sent without a `shot`, and PeerJS's
 * binary serializer turns sent `undefined` values into `null` on the wire, so
 * both must be treated as "shot not given" — otherwise guests would drop the
 * clearing message and keep a stale countdown on screen.
 */
export function parseCountdownMessage(message) {
  if (!message || message.type !== "countdown") return null;
  const validValue = message.value === null ||
    message.value === "📸" ||
    (Number.isInteger(message.value) && message.value >= 0 && message.value <= 3);
  const shotAbsent = message.shot === undefined || message.shot === null;
  const shotValid = Number.isInteger(message.shot) &&
    message.shot >= 0 &&
    message.shot <= PHOTO_SHOT_COUNT;
  const totalValid = message.total === undefined ||
    message.total === null ||
    message.total === PHOTO_SHOT_COUNT;
  if (!validValue || (!shotAbsent && !shotValid) || !totalValid) return null;
  if (shotAbsent) return { value: message.value };
  return {
    value: message.value,
    meta: { shot: message.shot, total: message.total ?? PHOTO_SHOT_COUNT },
  };
}

export function receiveRoster(session, peerIds) {
  if (
    !Array.isArray(peerIds) ||
    peerIds.length > MAX_PARTICIPANTS ||
    peerIds.some((peerId) => typeof peerId !== "string") ||
    new Set(peerIds).size !== peerIds.length
  ) {
    session.onStatus("Couldn't read the photobooth's participant list.");
    return;
  }
  if (!peerIds.includes(session.peerId)) {
    session.onRoomFull();
    session.onStatus("This room is full. The limit is four participants.");
    return;
  }
  session.markJoined();
  const departed = session.members.filter((memberId) => !peerIds.includes(memberId));
  session.members = peerIds;
  departed.forEach((memberId) => {
    session.calls.get(memberId)?.close();
    session.removeCall(memberId);
    session.cameraStates.delete(memberId);
  });
  session.publishParticipants();
  session.connectMembers();
}

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
