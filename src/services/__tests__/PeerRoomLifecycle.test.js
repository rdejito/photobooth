import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleGuestJoin } from "../PeerRoomLifecycle.js";
import { createConnection, createHostSession } from "./lifecycleTestHelpers.js";

describe("handleGuestJoin", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("re-seats a returning guest in place of its disconnected peer", () => {
    const session = createHostSession(["host", "old-guest"]);
    session.deviceIds.set("old-guest", "device-1");
    session.rejoinTokens.set("old-guest", "token-1");
    session.cameraStates.set("old-guest", true);
    session.remoteStreams.set("old-guest", { id: "old-stream" });
    const deadCall = { close: vi.fn() };
    session.calls.set("old-guest", deadCall);
    session.disconnectedPeers.add("old-guest");
    session.disconnectTimers.set("old-guest", setTimeout(() => {}, 10000));

    const connection = createConnection("new-guest");
    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken: "token-1",
      cameraEnabled: false,
    });

    expect(admitted).toBe(true);
    // The seat is carried over, keeping the same roster size (no reflow).
    expect(session.members).toEqual(["host", "new-guest"]);
    expect(session.deviceIds.get("new-guest")).toBe("device-1");
    expect(session.deviceIds.has("old-guest")).toBe(false);
    expect(session.cameraStates.get("new-guest")).toBe(false);
    expect(session.cameraStates.has("old-guest")).toBe(false);
    expect(deadCall.close).toHaveBeenCalledOnce();
    expect(session.calls.has("old-guest")).toBe(false);
    expect(session.remoteStreams.has("old-guest")).toBe(false);
    expect(session.disconnectTimers.size).toBe(0);
    expect(session.disconnectedPeers.size).toBe(0);
    expect(session.publishParticipants).toHaveBeenCalled();
  });

  it("adds a brand new guest as an extra seat", () => {
    const session = createHostSession();
    const connection = createConnection("guest-1");

    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "new-device",
    });

    expect(admitted).toBe(true);
    expect(session.members).toEqual(["host", "guest-1"]);
    expect(session.deviceIds.get("guest-1")).toBe("new-device");
    expect(session.cameraStates.get("guest-1")).toBe(true);
  });

  it("turns a new guest away when the room is full without disturbing seats", () => {
    const session = createHostSession(["host", "a", "b", "c"]);
    const connection = createConnection("guest-1");

    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "x",
    });

    expect(admitted).toBe(false);
    expect(connection.send).toHaveBeenCalledWith({ type: "room-full" });
    expect(session.members).toEqual(["host", "a", "b", "c"]);
    expect(session.publishParticipants).not.toHaveBeenCalled();
  });

  it("lets a returning guest back in even when the room looks full", () => {
    // The grace-window seat still counts toward the limit, so the returning
    // guest must reclaim it instead of being rejected as a new arrival.
    const session = createHostSession(["host", "a", "b", "old-guest"]);
    session.deviceIds.set("old-guest", "device-1");
    session.rejoinTokens.set("old-guest", "token-1");
    session.disconnectedPeers.add("old-guest");
    session.disconnectTimers.set("old-guest", setTimeout(() => {}, 10000));

    const connection = createConnection("new-guest");
    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken: "token-1",
    });

    expect(admitted).toBe(true);
    expect(session.members).toEqual(["host", "a", "b", "new-guest"]);
  });

  it("reclaims the seat when the rejoin arrives before the host registers the drop", () => {
    // Fast reload: the host has not yet seen the old tab's departure, so no
    // grace-window state exists — the seat must still be reclaimed, otherwise
    // the reconnecting guest would be appended as a duplicate participant.
    const session = createHostSession(["host", "old-guest"]);
    session.deviceIds.set("old-guest", "device-1");
    session.rejoinTokens.set("old-guest", "token-1");
    const connection = createConnection("reload-guest");

    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken: "token-1",
      cameraEnabled: false,
    });

    expect(admitted).toBe(true);
    expect(session.members).toEqual(["host", "reload-guest"]);
    expect(session.deviceIds.get("reload-guest")).toBe("device-1");
    expect(session.deviceIds.has("old-guest")).toBe(false);
  });

  it("lets the newest tab take over the device's seat instead of duplicating it", () => {
    const session = createHostSession(["host", "live-guest"]);
    session.deviceIds.set("live-guest", "device-1");
    session.rejoinTokens.set("live-guest", "token-1");
    const liveConnection = createConnection("live-guest");
    session.connections.set("live-guest", liveConnection);

    const connection = createConnection("tab-2");
    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken: "token-1",
    });

    expect(admitted).toBe(true);
    expect(session.members).toEqual(["host", "tab-2"]);
    expect(session.deviceIds.get("tab-2")).toBe("device-1");
    expect(liveConnection.close).toHaveBeenCalled();
  });

  it("lets a reconnecting guest replace its seat even when the room is full", () => {
    // A full room must not reject the device that already occupies a seat: the
    // reloading guest reclaims it rather than being turned away or duplicated.
    const session = createHostSession(["host", "a", "b", "old-guest"]);
    session.deviceIds.set("old-guest", "device-1");
    session.rejoinTokens.set("old-guest", "token-1");
    const oldConnection = createConnection("old-guest");
    session.connections.set("old-guest", oldConnection);

    const connection = createConnection("reload-guest");
    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken: "token-1",
    });

    expect(admitted).toBe(true);
    expect(session.members).toEqual(["host", "a", "b", "reload-guest"]);
    expect(connection.send).not.toHaveBeenCalledWith({ type: "room-full" });
    expect(oldConnection.close).toHaveBeenCalled();
  });

  it("treats a repeat connection from the same peer as a refresh, not a new seat", () => {
    const session = createHostSession(["host", "guest-1"]);

    const connection = createConnection("guest-1");
    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      cameraEnabled: false,
    });

    expect(admitted).toBe(true);
    expect(session.members).toEqual(["host", "guest-1"]);
    expect(session.markPeerConnected).toHaveBeenCalledWith("guest-1");
    expect(session.cameraStates.get("guest-1")).toBe(false);
  });

});
