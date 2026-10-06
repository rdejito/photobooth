const MAX_PARTICIPANTS = 4;

export function attachRoomConnection(session, connection) {
  session.connections.set(connection.peer, connection);
  connection.on("open", () => {
    if (!session.isHost) connection.send({ type: "join" });
  });
  connection.on("data", (message) => handleRoomMessage(session, connection, message));
  connection.on("close", () => session.removeMember(connection.peer));
  connection.on("error", () => session.removeMember(connection.peer));
}

function handleRoomMessage(session, connection, message) {
  if (!message || typeof message !== "object") return;
  if (
    (session.isHost && !session.members.includes(connection.peer) && message.type !== "join") ||
    (!session.isHost && connection.peer !== session.roomHostId)
  ) return;
  if (message.type === "join" && session.isHost) {
    if (!session.members.includes(connection.peer) &&
        session.members.length >= MAX_PARTICIPANTS) {
      connection.send({ type: "room-full" });
      session.onStatus("This room is full. The limit is four participants.");
      return;
    }
    if (!session.members.includes(connection.peer)) {
      session.members = [...session.members, connection.peer];
      session.publishParticipants();
      broadcastRoster(session);
      session.connectMembers();
    }
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
  if (message.type === "photo-start" || message.type === "photo-chunk") {
    session.photoTransfer.receive(connection, message);
    return;
  }
  if (message.type === "room-closed") {
    session.onStatus("The room creator ended the photobooth.");
    session.onRoomClosed();
    return;
  }
  if (message.type === "countdown" && !session.isHost) {
    const valid = message.value === null ||
      message.value === "📸" ||
      (Number.isInteger(message.value) && message.value >= 0 && message.value <= 3);
    if (valid) session.onCountdown(message.value);
  }
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
  const departed = session.members.filter((memberId) => !peerIds.includes(memberId));
  session.members = peerIds;
  departed.forEach((memberId) => {
    session.calls.get(memberId)?.close();
    session.removeCall(memberId);
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

export function broadcastCountdown(session, value) {
  if (!session.isHost) return;
  for (const connection of session.connections.values()) {
    if (session.members.includes(connection.peer) && connection.open) {
      connection.send({ type: "countdown", value });
    }
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
