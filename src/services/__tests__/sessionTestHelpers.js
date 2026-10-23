import { vi } from "vitest";
import { PeerRoomSession } from "../PeerRoomSession.js";

/** A minimal local MediaStream stand-in exposing only the track `stop` call. */
export function createLocalStream() {
  const stop = vi.fn();
  return {
    stream: { getTracks: () => [{ stop }] },
    stop,
  };
}

/** A connection stand-in exposing the methods destroy/teardown touch. */
export function createConnection(peer, { open = true } = {}) {
  return { peer, open, send: vi.fn(), close: vi.fn() };
}

/** A call stand-in exposing the methods used by the session. */
export function createCall(peer) {
  const handlers = {};
  return {
    peer,
    handlers,
    close: vi.fn(),
    answer: vi.fn(),
    on: (event, handler) => {
      handlers[event] = handler;
    },
  };
}

export function createSession({ localStream, isHost = false } = {}) {
  const participants = [];
  const statuses = [];
  const session = new PeerRoomSession({
    stream: localStream,
    onParticipants: (next) => participants.push(next),
    onStatus: (message) => statuses.push(message),
    onPhoto: () => {},
    onCountdown: () => {},
    onRoomFull: () => {},
    onRoomClosed: () => {},
    onConnectionFailed: () => {},
  });
  session.isHost = isHost;
  session.peerId = isHost ? "host" : "self";
  session.roomHostId = "host";
  session.members = isHost ? ["host"] : ["self", "host"];
  session.cameraStates.set(session.peerId, true);
  return { session, participants, statuses };
}

export const latest = (participants) => participants[participants.length - 1];
