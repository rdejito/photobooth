import { describe, expect, it, vi } from "vitest";
import { pack, unpack } from "peerjs-js-binarypack";
import {
  attachRoomConnection,
  broadcastCountdown,
  parseCountdownMessage,
} from "../PeerRoomMessaging.js";

describe("parseCountdownMessage", () => {
  it("accepts the clearing null message when the shot key is absent", () => {
    expect(parseCountdownMessage({ type: "countdown", value: null })).toEqual({
      value: null,
    });
    expect(parseCountdownMessage({ type: "countdown", value: null, total: 4 })).toEqual({
      value: null,
    });
  });

  it("accepts a clearing message after PeerJS serialization turns shot:undefined into null", () => {
    const roundTripped = unpack(
      pack({ type: "countdown", value: null, shot: undefined, total: 4 }),
    );
    expect(roundTripped.shot).toBeNull();
    expect(parseCountdownMessage(roundTripped)).toEqual({ value: null });
  });

  it("accepts a clearing message carrying shot:null directly", () => {
    expect(
      parseCountdownMessage({ type: "countdown", value: null, shot: null, total: 4 }),
    ).toEqual({ value: null });
  });

  it("accepts numbered and capture-moment messages with valid shot metadata", () => {
    expect(parseCountdownMessage({ type: "countdown", value: 3, shot: 1, total: 4 })).toEqual({
      value: 3,
      meta: { shot: 1, total: 4 },
    });
    expect(parseCountdownMessage({ type: "countdown", value: "📸", shot: 4, total: 4 })).toEqual({
      value: "📸",
      meta: { shot: 4, total: 4 },
    });
  });

  it("rejects messages with invalid values, shots, or totals", () => {
    expect(parseCountdownMessage({ type: "countdown", value: 9, shot: 1, total: 4 })).toBeNull();
    expect(parseCountdownMessage({ type: "countdown", value: 3, shot: 5, total: 4 })).toBeNull();
    expect(parseCountdownMessage({ type: "countdown", value: 3, shot: "x", total: 4 })).toBeNull();
    expect(parseCountdownMessage({ type: "countdown", value: 3, shot: 1, total: 3 })).toBeNull();
    expect(parseCountdownMessage({ type: "other", value: 3 })).toBeNull();
    expect(parseCountdownMessage(null)).toBeNull();
  });
});

describe("broadcastCountdown", () => {
  const createSession = ({ isHost = true } = {}) => ({
    isHost,
    members: ["guest-1"],
    connections: new Map([
      ["guest-1", { peer: "guest-1", open: true, send: vi.fn() }],
    ]),
  });

  it("omits the shot key on the clearing message", () => {
    const session = createSession();
    broadcastCountdown(session, null);
    expect(session.connections.get("guest-1").send).toHaveBeenCalledWith({
      type: "countdown",
      value: null,
      total: 4,
    });
  });

  it("includes the shot number on regular countdown messages", () => {
    const session = createSession();
    broadcastCountdown(session, 3, { shot: 1, total: 4 });
    expect(session.connections.get("guest-1").send).toHaveBeenCalledWith({
      type: "countdown",
      value: 3,
      shot: 1,
      total: 4,
    });
  });

  it("does not broadcast from a guest session", () => {
    const session = createSession({ isHost: false });
    broadcastCountdown(session, null);
    expect(session.connections.get("guest-1").send).not.toHaveBeenCalled();
  });
});

describe("attachRoomConnection departure handling", () => {
  /** A connection stand-in that records the handlers the session registers. */
  function createConnection(peer = "guest-1") {
    const handlers = {};
    return {
      peer,
      open: true,
      handlers,
      send: vi.fn(),
      close: vi.fn(),
      on: (event, handler) => {
        handlers[event] = handler;
      },
    };
  }

  function createHostSession() {
    return {
      isHost: true,
      joined: true,
      members: ["host", "guest-1"],
      connections: new Map(),
      removeMember: vi.fn(),
      handlePeerDisconnected: vi.fn(),
      failJoin: vi.fn(),
    };
  }

  it("removes a member immediately on an explicit leave", () => {
    const session = createHostSession();
    const connection = createConnection();
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "leave" });

    expect(session.removeMember).toHaveBeenCalledWith("guest-1");
    expect(session.handlePeerDisconnected).not.toHaveBeenCalled();
  });

  it("starts the disconnect grace period on an unload departing message", () => {
    const session = createHostSession();
    const connection = createConnection();
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "departing" });

    expect(session.handlePeerDisconnected).toHaveBeenCalledWith("guest-1");
    expect(session.removeMember).not.toHaveBeenCalled();
  });

  it("starts the disconnect grace period when the connection drops", () => {
    const session = createHostSession();
    const connection = createConnection();
    attachRoomConnection(session, connection);

    connection.handlers.close();

    expect(session.handlePeerDisconnected).toHaveBeenCalledWith("guest-1");
  });
});

describe("attachRoomConnection rejoin handling", () => {
  function createConnection(peer) {
    const handlers = {};
    return {
      peer,
      open: true,
      handlers,
      send: vi.fn(),
      close: vi.fn(),
      on: (event, handler) => {
        handlers[event] = handler;
      },
    };
  }

  function createHostSession() {
    return {
      isHost: true,
      peerId: "host",
      joined: true,
      members: ["host"],
      deviceIds: new Map(),
      cameraStates: new Map([["host", true]]),
      calls: new Map(),
      remoteStreams: new Map(),
      connections: new Map(),
      disconnectTimers: new Map(),
      disconnectedPeers: new Set(),
      onStatus: vi.fn(),
      publishParticipants: vi.fn(),
      markPeerConnected: vi.fn(),
      removeMember: vi.fn(),
      handlePeerDisconnected: vi.fn(),
      failJoin: vi.fn(),
      connectMembers: vi.fn(),
    };
  }

  it("admits a new guest, records its rejoin id, and broadcasts the roster", () => {
    const session = createHostSession();
    const connection = createConnection("guest-1");
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "join", deviceId: "device-1" });

    expect(session.members).toEqual(["host", "guest-1"]);
    expect(session.deviceIds.get("guest-1")).toBe("device-1");
    expect(connection.send).toHaveBeenCalledWith({
      type: "roster",
      peerIds: ["host", "guest-1"],
    });
    expect(session.connectMembers).toHaveBeenCalled();
  });

  it("sends this device's rejoin id when a guest announces itself", () => {
    const session = {
      ...createHostSession(),
      isHost: false,
      peerId: "self",
      cameraStates: new Map([["self", true]]),
      deviceId: "device-1",
    };
    const connection = createConnection("host");
    attachRoomConnection(session, connection);

    connection.handlers.open();

    expect(connection.send).toHaveBeenCalledWith({
      type: "join",
      cameraEnabled: true,
      deviceId: "device-1",
    });
  });
});
