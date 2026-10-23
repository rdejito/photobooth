import { describe, expect, it, vi } from "vitest";
import { pack, unpack } from "peerjs-js-binarypack";
import { broadcastCountdown } from "../PeerRoomBroadcast.js";
import { parseCountdownMessage } from "../PeerRoomMessaging.js";

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
