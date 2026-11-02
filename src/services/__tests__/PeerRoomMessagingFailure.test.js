import { describe, expect, it, vi } from "vitest";
import {
  attachRoomConnection,
  DIRECT_CONNECTION_FAILED_MESSAGE,
} from "../PeerRoomMessaging.js";

/** Records the handlers the session registers on a connection. */
function createConnection(peer = "host") {
  const handlers = {};
  return {
    peer,
    open: false,
    handlers,
    send: vi.fn(),
    close: vi.fn(),
    on: (event, handler) => {
      handlers[event] = handler;
    },
  };
}

function createGuestSession() {
  return {
    isHost: false,
    joined: false,
    peerId: "self",
    roomHostId: "host",
    connections: new Map(),
    failJoin: vi.fn(),
    handlePeerDisconnected: vi.fn(),
  };
}

describe("attachRoomConnection network failures", () => {
  it("names the network path when ICE gives up", () => {
    const session = createGuestSession();
    const connection = createConnection();
    attachRoomConnection(session, connection);

    connection.handlers.error({ type: "negotiation-failed" });

    expect(session.failJoin).toHaveBeenCalledWith(
      DIRECT_CONNECTION_FAILED_MESSAGE,
      "ice-failed",
    );
  });

  it("fails fast on an ICE state of failed, before the join timeout", () => {
    const session = createGuestSession();
    const connection = createConnection();
    attachRoomConnection(session, connection);

    connection.handlers.iceStateChanged("failed");

    expect(session.failJoin).toHaveBeenCalledWith(
      DIRECT_CONNECTION_FAILED_MESSAGE,
      "ice-failed",
    );
  });

  it("ignores ICE states that are still negotiating", () => {
    const session = createGuestSession();
    const connection = createConnection();
    attachRoomConnection(session, connection);

    connection.handlers.iceStateChanged("checking");
    connection.handlers.iceStateChanged("disconnected");

    expect(session.failJoin).not.toHaveBeenCalled();
  });

  it("keeps the room-not-found message for a missing host", () => {
    const session = createGuestSession();
    const connection = createConnection();
    attachRoomConnection(session, connection);

    connection.handlers.error({ type: "peer-unavailable" });

    expect(session.failJoin).toHaveBeenCalledWith(
      "Couldn't find that room. Check the code and make sure the host's booth is still open.",
      "peer-unavailable",
    );
  });

  it("does not report a guest-side ICE failure on the host", () => {
    const session = { ...createGuestSession(), isHost: true, joined: true };
    const connection = createConnection("guest-1");
    attachRoomConnection(session, connection);

    connection.handlers.iceStateChanged("failed");

    expect(session.failJoin).not.toHaveBeenCalled();
  });
});
