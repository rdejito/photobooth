import { DISCONNECT_GRACE_MS, MAX_PARTICIPANTS } from "../lib/constants.js";
import { createRejoinToken } from "../lib/rejoin.js";

/**
 * Presence and teardown helpers for a `PeerRoomSession`.
 *
 * Split out of `PeerRoomSession` so the class stays focused on room wiring and
 * within the project's line budget. Every function takes the session as its
 * first argument, mirroring the `PeerRoomMessaging` helpers.
 */

/**
 * Marks a peer as reconnected, cancelling any pending removal. Called when a
 * fresh stream arrives so a brief drop can recover in place.
 */
export function markPeerConnected(session, peerId) {
  const timer = session.disconnectTimers.get(peerId);
  if (timer) {
    clearTimeout(timer);
    session.disconnectTimers.delete(peerId);
  }
  session.disconnectedPeers.delete(peerId);
}

/**
 * Handles a peer's connection dropping without an explicit `leave`. The stale
 * stream is detached immediately so the tile shows the "Reconnecting…"
 * placeholder instead of a frozen frame; the tile is only removed (and the
 * roster reflowed) once the grace period lapses without a reconnect.
 */
export function handlePeerDisconnected(session, peerId) {
  if (session.destroyed) return;
  if (peerId === session.peerId || !session.members.includes(peerId)) return;
  session.photoTransfer?.removePeer?.(peerId);
  // Drop the dead call and its stream so the tile shows the placeholder and a
  // reconnecting call can take its place: `connectMembers` and
  // `attachIncomingCall` both skip peers that still have an entry in `calls`.
  session.calls.delete(peerId);
  session.remoteStreams.delete(peerId);
  session.disconnectedPeers.add(peerId);
  session.publishParticipants();
  if (session.disconnectTimers.has(peerId)) return;
  const timer = setTimeout(() => {
    session.disconnectTimers.delete(peerId);
    session.disconnectedPeers.delete(peerId);
    session.removeMember(peerId);
  }, DISCONNECT_GRACE_MS);
  session.disconnectTimers.set(peerId, timer);
}

/**
 * Removes a seated guest, closing its call and dropping any transfer it left
 * in flight. `broadcastRoster` is injected to keep this module free of a cycle
 * with the messaging layer.
 */
export function removeMemberFromRoom(session, peerId, broadcastRoster) {
  if (peerId === session.peerId || !session.members.includes(peerId)) return;
  session.markPeerConnected(peerId);
  session.members = session.members.filter((id) => id !== peerId);
  session.photoTransfer?.removePeer?.(peerId);
  const connection = session.connections.get(peerId);
  session.connections.delete(peerId);
  connection?.close();
  session.cameraStates.delete(peerId);
  session.calls.get(peerId)?.close();
  session.removeCall(peerId);
  session.deviceIds.delete(peerId);
  session.rejoinTokens?.delete(peerId);
  if (session.isHost) {
    broadcastRoster(session);
    session.connectMembers();
  }
}

/**
 * Finds the still-seated peer that a rejoin id belongs to, if any. Matching is
 * scoped to `members` so a stale id left over after a removal cannot resurrect.
 */
function findSeatByDeviceId(session, deviceId) {
  for (const [peerId, id] of session.deviceIds) {
    if (id === deviceId && session.members.includes(peerId)) return peerId;
  }
  return null;
}

/**
 * Hands a returning guest's old seat to its new peer id. The roster slot is
 * carried over (so the tile resumes in place instead of the roster dipping and
 * reflowing) and the pending disconnect removal is cancelled. The camera state
 * is adopted from the fresh join message — that is the camera's real state in
 * the new session, not the departed session's historical one.
 */
function seatReturningGuest(session, returningId, newPeerId, cameraEnabled) {
  const timer = session.disconnectTimers.get(returningId);
  if (timer) {
    clearTimeout(timer);
    session.disconnectTimers.delete(returningId);
  }
  session.disconnectedPeers.delete(returningId);
  const index = session.members.indexOf(returningId);
  if (index !== -1) session.members[index] = newPeerId;
  session.cameraStates.set(newPeerId, cameraEnabled);
  session.cameraStates.delete(returningId);
  session.calls.get(returningId)?.close();
  session.calls.delete(returningId);
  session.remoteStreams.delete(returningId);
  const oldConnection = session.connections.get(returningId);
  if (oldConnection?.open) oldConnection.close();
  session.connections.delete(returningId);
  session.deviceIds.delete(returningId);
  session.rejoinTokens?.delete(returningId);
}

/**
 * Admits a guest (or re-admits a refreshed one) to the host's room. A returning
 * guest sends the same `deviceId` it used before plus the token the host issued
 * at admission, so its new peer id reclaims the departed seat rather than being
 * appended as an extra participant. A missing or wrong token is treated as a
 * new guest and never evicts the seated peer. When the same device reconnects
 * (a reload or a second tab), the newest session wins the seat; its
 * predecessor's connection is closed. Every admitted guest receives a rotated
 * token for the next rejoin.
 *
 * @returns {boolean} False when the room is full and the guest was rejected.
 */
export function handleGuestJoin(session, connection, message) {
  const deviceId =
    typeof message.deviceId === "string" && message.deviceId ? message.deviceId : null;
  const rejoinToken =
    typeof message.rejoinToken === "string" && message.rejoinToken
      ? message.rejoinToken
      : null;
  const cameraEnabled =
    typeof message.cameraEnabled === "boolean" ? message.cameraEnabled : true;
  const existing = session.members.includes(connection.peer);
  // Reclaim any seated peer this device id already owns. Deliberately not gated
  // on the disconnect grace window: on a fast reload the rejoin can beat the
  // host's processing of the old tab's drop, and gating on it would append a
  // duplicate seat (or reject the returning guest once the room is full).
  // The seat is only handed over when the host-issued token matches, so a
  // leaked or guessed device id cannot evict its owner; an unverified rejoin
  // falls through to the normal admission path as a new guest.
  const returningId =
    deviceId && !existing ? findSeatByDeviceId(session, deviceId) : null;
  const verifiedId =
    returningId && rejoinToken && session.rejoinTokens?.get(returningId) === rejoinToken
      ? returningId
      : null;

  if (!existing && !verifiedId && session.members.length >= MAX_PARTICIPANTS) {
    connection.send({ type: "room-full" });
    session.onStatus("This room is full. The limit is four participants.");
    session.connections.delete(connection.peer);
    connection.close();
    return false;
  }

  if (verifiedId) {
    seatReturningGuest(session, verifiedId, connection.peer, cameraEnabled);
  } else if (existing) {
    session.markPeerConnected(connection.peer);
    session.cameraStates.set(connection.peer, cameraEnabled);
  } else {
    session.members = [...session.members, connection.peer];
    session.cameraStates.set(connection.peer, cameraEnabled);
  }
  // Never bind a duplicate device id to an unverified peer: it would let that
  // peer inherit the real owner's seat once that seat is freed.
  if (deviceId && (!returningId || verifiedId)) {
    session.deviceIds.set(connection.peer, deviceId);
    const token = createRejoinToken();
    session.rejoinTokens.set(connection.peer, token);
    connection.send({ type: "rejoin-token", rejoinToken: token });
  }
  session.publishParticipants();
  return true;
}

/**
 * Tears the session down: signals departure, closes every call/connection and
 * stops the local camera. An explicit "Leave booth" sends `leave`; an unload
 * (tab close/reload/navigation) sends `departing` instead, so remote peers
 * show the "Reconnecting…" status on the tile before the roster reflows
 * rather than dropping it instantly.
 *
 * @param {object} session - The session being torn down.
 * @param {object} [options]
 * @param {boolean} [options.unload] - True when tearing down for a page unload.
 */
export function destroyRoom(session, { unload = false } = {}) {
  if (session.destroyed) return;
  session.destroyed = true;
  clearTimeout(session.joinTimeout);
  session.joinTimeout = null;
  for (const timer of session.disconnectTimers.values()) clearTimeout(timer);
  session.disconnectTimers.clear();
  session.disconnectedPeers.clear();
  if (session.isHost) {
    for (const connection of session.connections.values()) {
      if (connection.open) connection.send({ type: "room-closed" });
    }
  } else {
    const hostConnection = session.connections.get(session.roomHostId);
    if (hostConnection?.open) {
      hostConnection.send(unload ? { type: "departing" } : { type: "leave" });
    }
  }
  for (const call of session.calls.values()) call.close();
  for (const connection of session.connections.values()) connection.close();
  session.peer?.destroy();
  session.stream.getTracks().forEach((track) => track.stop());
  session.connections.clear();
  session.calls.clear();
  session.remoteStreams.clear();
  session.cameraStates.clear();
  session.photoTransfer.clear();
}
