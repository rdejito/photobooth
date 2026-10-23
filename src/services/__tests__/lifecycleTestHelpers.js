import { vi } from "vitest";

/** A minimal host session covering the state handleGuestJoin touches. */
export function createHostSession(members = ["host"]) {
  return {
    isHost: true,
    peerId: "host",
    members: [...members],
    deviceIds: new Map(),
    rejoinTokens: new Map(),
    cameraStates: new Map([["host", true]]),
    calls: new Map(),
    remoteStreams: new Map(),
    connections: new Map(),
    disconnectTimers: new Map(),
    disconnectedPeers: new Set(),
    onStatus: vi.fn(),
    markPeerConnected: vi.fn(),
    publishParticipants: vi.fn(),
  };
}

export function createConnection(peer) {
  return { peer, open: true, send: vi.fn(), close: vi.fn() };
}
