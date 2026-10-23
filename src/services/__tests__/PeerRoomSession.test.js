import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISCONNECT_GRACE_MS } from "../../lib/constants.js";
import {
  createCall,
  createConnection,
  createLocalStream,
  createSession,
  latest,
} from "./sessionTestHelpers.js";

describe("PeerRoomSession teardown", () => {
  it("stops local tracks and closes calls/connections on an explicit leave", () => {
    const { stream, stop } = createLocalStream();
    const { session } = createSession({ localStream: stream });
    const hostConnection = createConnection("host");
    const call = createCall("host");
    session.connections.set("host", hostConnection);
    session.calls.set("host", call);

    session.destroy();

    expect(stop).toHaveBeenCalledOnce();
    expect(hostConnection.send).toHaveBeenCalledWith({ type: "leave" });
    expect(hostConnection.close).toHaveBeenCalledOnce();
    expect(call.close).toHaveBeenCalledOnce();
    expect(session.destroyed).toBe(true);
  });

  it("sends a departing message and still releases the camera on unload", () => {
    const { stream, stop } = createLocalStream();
    const { session } = createSession({ localStream: stream });
    const hostConnection = createConnection("host");
    session.connections.set("host", hostConnection);

    session.destroy({ unload: true });

    expect(stop).toHaveBeenCalledOnce();
    expect(hostConnection.send).toHaveBeenCalledWith({ type: "departing" });
    expect(session.destroyed).toBe(true);
  });

  it("closes the room for every guest when the host leaves", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    const guestA = createConnection("guest-a");
    const guestB = createConnection("guest-b");
    session.connections.set("guest-a", guestA);
    session.connections.set("guest-b", guestB);

    session.destroy();

    expect(guestA.send).toHaveBeenCalledWith({ type: "room-closed" });
    expect(guestB.send).toHaveBeenCalledWith({ type: "room-closed" });
  });

  it("closes a removed member's data connection", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    const connection = createConnection("guest-1");
    session.connections.set("guest-1", connection);

    session.removeMember("guest-1");

    expect(connection.close).toHaveBeenCalledOnce();
    expect(session.connections.has("guest-1")).toBe(false);
  });
});

describe("PeerRoomSession disconnect grace period", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a disconnected tile immediately, then removes it after the grace period", () => {
    const { stream } = createLocalStream();
    const { session, participants } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    session.cameraStates.set("guest-1", true);
    session.remoteStreams.set("guest-1", { id: "remote" });
    session.connections.set("guest-1", createConnection("guest-1"));
    session.calls.set("guest-1", createCall("guest-1"));

    session.handlePeerDisconnected("guest-1");

    const reconnecting = latest(participants).find(({ id }) => id === "guest-1");
    expect(reconnecting).toMatchObject({ connected: false, stream: null });
    expect(session.members).toContain("guest-1");
    // The dead call is dropped so a fresh call can be attached on reconnect.
    expect(session.calls.has("guest-1")).toBe(false);

    vi.advanceTimersByTime(DISCONNECT_GRACE_MS);

    expect(session.members).not.toContain("guest-1");
    expect(latest(participants).some(({ id }) => id === "guest-1")).toBe(false);
  });

  it("re-attaches a reconnecting call while the peer is still in the grace period", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    session.remoteStreams.set("guest-1", { id: "old" });
    session.calls.set("guest-1", createCall("guest-1"));

    session.handlePeerDisconnected("guest-1");

    // A reconnecting call arrives while the member is still listed.
    const reconnected = createCall("guest-1");
    session.attachIncomingCall(reconnected);
    expect(session.calls.get("guest-1")).toBe(reconnected);

    // Its stream lands, cancelling the pending removal.
    reconnected.handlers.stream({ id: "remote" });

    vi.advanceTimersByTime(DISCONNECT_GRACE_MS * 2);
    expect(session.members).toContain("guest-1");
  });

  it("keeps the tile when the peer reconnects within the grace period", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    session.remoteStreams.set("guest-1", { id: "remote" });

    session.handlePeerDisconnected("guest-1");
    session.markPeerConnected("guest-1");

    vi.advanceTimersByTime(DISCONNECT_GRACE_MS * 2);

    expect(session.members).toContain("guest-1");
    expect(session.disconnectedPeers.has("guest-1")).toBe(false);
  });

  it("removes a member immediately on an explicit leave and cancels any timer", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    session.connections.set("guest-1", createConnection("guest-1"));

    session.handlePeerDisconnected("guest-1");
    session.removeMember("guest-1");

    expect(session.members).not.toContain("guest-1");
    expect(session.disconnectTimers.size).toBe(0);

    // A later roster tick must not resurrect the member or throw.
    vi.advanceTimersByTime(DISCONNECT_GRACE_MS);
    expect(session.members).not.toContain("guest-1");
  });

  it("ignores the local peer and unknown peers", () => {
    const { stream } = createLocalStream();
    const { session, participants } = createSession({ localStream: stream, isHost: true });

    session.handlePeerDisconnected("host");
    session.handlePeerDisconnected("unknown");

    expect(session.disconnectedPeers.size).toBe(0);
    expect(participants.length).toBe(0);
  });

  it("clears pending disconnect timers on destroy", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];

    session.handlePeerDisconnected("guest-1");
    session.destroy();

    expect(session.disconnectTimers.size).toBe(0);
    vi.advanceTimersByTime(DISCONNECT_GRACE_MS);
    expect(session.disconnectedPeers.size).toBe(0);
  });
});
