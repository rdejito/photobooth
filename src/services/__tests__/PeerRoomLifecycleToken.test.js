import { describe, expect, it } from "vitest";
import { handleGuestJoin } from "../PeerRoomLifecycle.js";
import { createConnection, createHostSession } from "./lifecycleTestHelpers.js";

describe("handleGuestJoin rejoin tokens", () => {
  it("issues a fresh rejoin token to a newly admitted guest", () => {
    const session = createHostSession();
    const connection = createConnection("guest-1");

    handleGuestJoin(session, connection, { type: "join", deviceId: "device-1" });

    expect(connection.send).toHaveBeenCalledWith({
      type: "rejoin-token",
      rejoinToken: expect.any(String),
    });
    const [{ rejoinToken }] = connection.send.mock.calls.find(
      ([message]) => message.type === "rejoin-token",
    );
    expect(rejoinToken).toBeTruthy();
    expect(session.rejoinTokens.get("guest-1")).toBe(rejoinToken);
  });

  it("rotates the token when a returning guest reclaims its seat", () => {
    const session = createHostSession(["host", "old-guest"]);
    session.deviceIds.set("old-guest", "device-1");
    session.rejoinTokens.set("old-guest", "token-1");
    const connection = createConnection("new-guest");

    handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken: "token-1",
    });

    expect(session.rejoinTokens.has("old-guest")).toBe(false);
    expect(session.rejoinTokens.get("new-guest")).toEqual(expect.any(String));
    expect(session.rejoinTokens.get("new-guest")).not.toBe("token-1");
  });

  it.each([
    ["missing", undefined],
    ["wrong", "forged-token"],
  ])("does not reclaim or evict when the rejoin token is %s", (_label, rejoinToken) => {
    const session = createHostSession(["host", "a", "b", "old-guest"]);
    session.deviceIds.set("old-guest", "device-1");
    session.rejoinTokens.set("old-guest", "token-1");
    const oldConnection = createConnection("old-guest");
    session.connections.set("old-guest", oldConnection);
    const connection = createConnection("attacker");

    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken,
    });

    expect(admitted).toBe(false);
    expect(connection.send).toHaveBeenCalledWith({ type: "room-full" });
    expect(session.members).toEqual(["host", "a", "b", "old-guest"]);
    expect(session.deviceIds.get("old-guest")).toBe("device-1");
    expect(session.rejoinTokens.get("old-guest")).toBe("token-1");
    expect(oldConnection.close).not.toHaveBeenCalled();
  });

  it("admits an unverified rejoin as a new guest instead of taking the seat", () => {
    const session = createHostSession(["host", "old-guest"]);
    session.deviceIds.set("old-guest", "device-1");
    session.rejoinTokens.set("old-guest", "token-1");
    const oldConnection = createConnection("old-guest");
    session.connections.set("old-guest", oldConnection);
    const connection = createConnection("attacker");

    const admitted = handleGuestJoin(session, connection, {
      type: "join",
      deviceId: "device-1",
      rejoinToken: "forged-token",
    });

    expect(admitted).toBe(true);
    expect(session.members).toEqual(["host", "old-guest", "attacker"]);
    expect(session.deviceIds.get("old-guest")).toBe("device-1");
    // The duplicate id is not bound to the unverified peer, so it cannot
    // inherit the seat on a later reconnect.
    expect(session.deviceIds.has("attacker")).toBe(false);
    expect(session.rejoinTokens.get("old-guest")).toBe("token-1");
    expect(oldConnection.close).not.toHaveBeenCalled();
  });
});
