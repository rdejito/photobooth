import { describe, expect, it, vi } from "vitest";
import { PeerRoomSession } from "../PeerRoomSession.js";
import { createLocalStream, createSession } from "./sessionTestHelpers.js";

describe("PeerRoomSession rejoin bookkeeping", () => {
  it("forgets a departed guest's rejoin id", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    session.deviceIds.set("guest-1", "device-1");

    session.removeMember("guest-1");

    expect(session.deviceIds.has("guest-1")).toBe(false);
  });

  it("purges a removed guest's in-flight photo transfers", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    const removePeer = vi.fn();
    session.photoTransfer.removePeer = removePeer;

    session.removeMember("guest-1");

    expect(removePeer).toHaveBeenCalledWith("guest-1");
  });

  it("purges a disconnected guest's in-flight photo transfers", () => {
    const { stream } = createLocalStream();
    const { session } = createSession({ localStream: stream, isHost: true });
    session.members = ["host", "guest-1"];
    const removePeer = vi.fn();
    session.photoTransfer.removePeer = removePeer;

    session.handlePeerDisconnected("guest-1");

    expect(removePeer).toHaveBeenCalledWith("guest-1");
  });
});

describe("PeerRoomSession host peer errors", () => {
  it("does not fail the host when a peer error occurs after the host is ready", () => {
    const { stream } = createLocalStream();
    const onConnectionFailed = vi.fn();
    const session = new PeerRoomSession({
      stream,
      onParticipants: () => {},
      onStatus: () => {},
      onPhoto: () => {},
      onCountdown: () => {},
      onRoomFull: () => {},
      onRoomClosed: () => {},
      onConnectionFailed,
    });
    session.isHost = true;
    session.peerId = "host";
    session.roomHostId = "host";
    session.members = ["host"];
    session.joined = false;

    session.handlePeerError({ type: "peer-unavailable" });

    expect(onConnectionFailed).not.toHaveBeenCalled();
  });

  it("still fails the host on unavailable-id", () => {
    const { stream } = createLocalStream();
    const onConnectionFailed = vi.fn();
    const session = new PeerRoomSession({
      stream,
      onParticipants: () => {},
      onStatus: () => {},
      onPhoto: () => {},
      onCountdown: () => {},
      onRoomFull: () => {},
      onRoomClosed: () => {},
      onConnectionFailed,
    });
    session.isHost = true;
    session.peerId = "host";
    session.roomHostId = "host";
    session.members = ["host"];
    session.joined = false;

    session.handlePeerError({ type: "unavailable-id" });

    expect(onConnectionFailed).toHaveBeenCalled();
  });

  it("does not fail the host on network/webrtc errors", () => {
    const { stream } = createLocalStream();
    const onConnectionFailed = vi.fn();
    const session = new PeerRoomSession({
      stream,
      onParticipants: () => {},
      onStatus: () => {},
      onPhoto: () => {},
      onCountdown: () => {},
      onRoomFull: () => {},
      onRoomClosed: () => {},
      onConnectionFailed,
    });
    session.isHost = true;
    session.joined = false;

    session.handlePeerError({ type: "network" });
    session.handlePeerError({ type: "webrtc" });

    expect(onConnectionFailed).not.toHaveBeenCalled();
  });
});
