import { describe, expect, it, vi } from "vitest";
import { broadcastPhoto } from "../PeerRoomBroadcast.js";
import { attachRoomConnection } from "../PeerRoomMessaging.js";

/**
 * A photo "clear" is the host dismissing an unsaved preview. It travels over
 * the room channel as a control message rather than a photo payload, so guests
 * close the preview without downloading a second image.
 */
describe("broadcastPhoto clearing", () => {
  it("sends a photo-cleared message to each open member", () => {
    const session = {
      isHost: true,
      members: ["host", "guest-1", "guest-2"],
      connections: new Map([
        ["guest-1", { peer: "guest-1", open: true, send: vi.fn() }],
        ["guest-2", { peer: "guest-2", open: true, send: vi.fn() }],
      ]),
    };

    broadcastPhoto(session, { cleared: true, captureId: "cap-123" });

    expect(session.connections.get("guest-1").send).toHaveBeenCalledWith({
      type: "photo-cleared",
      captureId: "cap-123",
    });
    expect(session.connections.get("guest-2").send).toHaveBeenCalledWith({
      type: "photo-cleared",
      captureId: "cap-123",
    });
  });

  it("skips closed connections", () => {
    const send = vi.fn();
    const session = {
      isHost: true,
      members: ["host", "guest-1"],
      connections: new Map([["guest-1", { peer: "guest-1", open: false, send }]]),
    };

    broadcastPhoto(session, { cleared: true, captureId: "cap" });

    expect(send).not.toHaveBeenCalled();
  });

  it("does not let a guest broadcast a clear", () => {
    const send = vi.fn();
    const session = {
      isHost: false,
      members: ["host", "guest"],
      connections: new Map([["host", { peer: "host", open: true, send }]]),
    };

    broadcastPhoto(session, { cleared: true, captureId: "cap" });

    expect(send).not.toHaveBeenCalled();
  });

  it("does nothing when the capture id is not a string", () => {
    const send = vi.fn();
    const session = {
      isHost: true,
      members: ["guest-1"],
      connections: new Map([["guest-1", { peer: "guest-1", open: true, send }]]),
    };

    broadcastPhoto(session, { cleared: true, captureId: null });

    expect(send).not.toHaveBeenCalled();
  });
});

describe("attachRoomConnection photo clear handling", () => {
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

  it("delivers the host's clear to the guest photo handler", () => {
    const session = {
      isHost: false,
      roomHostId: "host",
      joined: true,
      members: ["host", "guest"],
      connections: new Map(),
      onPhoto: vi.fn(),
    };
    const connection = createConnection("host");
    attachRoomConnection(session, connection);

    connection.handlers.data({ type: "photo-cleared", captureId: "cap-9" });

    expect(session.onPhoto).toHaveBeenCalledWith({
      cleared: true,
      captureId: "cap-9",
    });
  });

  it("ignores clears from non-host peers and ignores them on the host", () => {
    const guestSession = {
      isHost: false,
      roomHostId: "host",
      joined: true,
      members: ["host", "guest"],
      connections: new Map(),
      onPhoto: vi.fn(),
    };
    const badConnection = createConnection("evil");
    attachRoomConnection(guestSession, badConnection);
    badConnection.handlers.data({ type: "photo-cleared", captureId: "cap" });
    expect(guestSession.onPhoto).not.toHaveBeenCalled();

    const hostSession = {
      isHost: true,
      joined: true,
      members: ["host", "guest"],
      connections: new Map(),
      onPhoto: vi.fn(),
    };
    const guestConnection = createConnection("guest");
    attachRoomConnection(hostSession, guestConnection);
    guestConnection.handlers.data({ type: "photo-cleared", captureId: "cap" });
    expect(hostSession.onPhoto).not.toHaveBeenCalled();
  });
});
