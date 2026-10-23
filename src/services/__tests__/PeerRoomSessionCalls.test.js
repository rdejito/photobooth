import { describe, expect, it } from "vitest";
import { createCall, createLocalStream, createSession } from "./sessionTestHelpers.js";

describe("PeerRoomSession call lifecycle", () => {
  it("ignores a late close from a call that has been replaced", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    const replacedCall = createCall("guest-1");
    session.attachCall(replacedCall);
    const liveCall = createCall("guest-1");
    session.attachCall(liveCall);

    replacedCall.handlers.close();

    expect(session.calls.get("guest-1")).toBe(liveCall);
    expect(session.members).toContain("guest-1");
    expect(session.disconnectedPeers.has("guest-1")).toBe(false);
  });

  it("replaces an existing call with a duplicate incoming call", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    const existingCall = createCall("guest-1");
    session.attachCall(existingCall);
    const incomingCall = createCall("guest-1");

    session.attachIncomingCall(incomingCall);

    expect(session.calls.get("guest-1")).toBe(incomingCall);
    expect(incomingCall.answer).toHaveBeenCalledWith(stream);
    expect(existingCall.close).toHaveBeenCalledOnce();
  });
});
