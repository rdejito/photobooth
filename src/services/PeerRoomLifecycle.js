import { DISCONNECT_GRACE_MS } from "../lib/constants.js";

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
