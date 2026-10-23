import { describe, expect, it, vi } from "vitest";
import { attachRoomConnection } from "../PeerRoomMessaging.js";

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

describe("room-level message authorisation", () => {
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
      roomHostId: "host",
      joined: true,
      members: ["host", "guest-1"],
      connections: new Map(),
      cameraStates: new Map(),
      onStatus: vi.fn(),
      onRoomFull: vi.fn(),
      onRoomClosed: vi.fn(),
      photoTransfer: { receive: vi.fn() },
      removeMember: vi.fn(),
      handlePeerDisconnected: vi.fn(),
      failJoin: vi.fn(),
    };
  }

  function createGuestSession() {
    return {
      isHost: false,
      peerId: "self",
      roomHostId: "host",
      joined: true,
      members: ["self", "host"],
      connections: new Map(),
      cameraStates: new Map(),
      onStatus: vi.fn(),
      onRoomFull: vi.fn(),
      onRoomClosed: vi.fn(),
      photoTransfer: { receive: vi.fn() },
      failJoin: vi.fn(),
    };
  }

  it("ignores room-closed and room-full sent by a guest", () => {
    const session = createHostSession();
    const connection = createConnection("guest-1");
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "room-closed" });
    connection.handlers.data({ type: "room-full" });

    expect(session.onRoomClosed).not.toHaveBeenCalled();
    expect(session.onRoomFull).not.toHaveBeenCalled();
  });

  it("still ends the room when the host sends room-closed to a guest", () => {
    const session = createGuestSession();
    const connection = createConnection("host");
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "room-closed" });

    expect(session.onRoomClosed).toHaveBeenCalledOnce();
  });

  it("does not accept photo messages on the host", () => {
    const session = createHostSession();
    const connection = createConnection("guest-1");
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "photo-start", id: "p", total: 1 });
    connection.handlers.data({ type: "photo-chunk", id: "p", index: 0, data: "x" });

    expect(session.photoTransfer.receive).not.toHaveBeenCalled();
  });

  it("stores and reports the host-issued rejoin token on a guest", () => {
    const session = { ...createGuestSession(), onRejoinToken: vi.fn() };
    const connection = createConnection("host");
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "rejoin-token", rejoinToken: "token-1" });

    expect(session.rejoinToken).toBe("token-1");
    expect(session.onRejoinToken).toHaveBeenCalledWith("token-1");
  });

  it("ignores a malformed rejoin token on a guest", () => {
    const session = { ...createGuestSession(), onRejoinToken: vi.fn() };
    const connection = createConnection("host");
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "rejoin-token", rejoinToken: "" });

    expect(session.rejoinToken).toBeUndefined();
    expect(session.onRejoinToken).not.toHaveBeenCalled();
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
      rejoinTokens: new Map(),
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
      rejoinToken: "token-1",
    };
    const connection = createConnection("host");
    attachRoomConnection(session, connection);

    connection.handlers.open();

    expect(connection.send).toHaveBeenCalledWith({
      type: "join",
      cameraEnabled: true,
      deviceId: "device-1",
      rejoinToken: "token-1",
    });
  });
});
