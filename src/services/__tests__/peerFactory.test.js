import { afterEach, describe, expect, it, vi } from "vitest";

const { peerConstructor, peerMock } = vi.hoisted(() => {
  const peerConstructor = vi.fn();
  return { peerConstructor, peerMock: peerConstructor };
});

vi.mock("peerjs", () => ({ default: peerMock }));

const { createPeer, createPeerConfig } = await import("../peerFactory.js");

const TURN_ENV = {
  VITE_TURN_URLS: "turn:turn.example.com:3478",
  VITE_TURN_USERNAME: "photobooth",
  VITE_TURN_CREDENTIAL: "secret",
};

describe("createPeerConfig", () => {
  it("leaves PeerJS's own defaults in place when no relay is configured", () => {
    expect(createPeerConfig({})).toEqual({});
    expect(createPeerConfig({ VITE_TURN_URLS: " , " })).toEqual({});
  });

  it("builds the STUN and credentialled TURN servers", () => {
    const { config } = createPeerConfig(TURN_ENV);

    expect(config.iceServers[0]).toEqual({ urls: ["stun:stun.l.google.com:19302"] });
    expect(config.iceServers[1]).toEqual({
      urls: ["turn:turn.example.com:3478", "turn:turn.example.com:3478?transport=tcp"],
      username: "photobooth",
      credential: "secret",
    });
  });

  it("adds a TCP twin so a UDP-blocked network can still relay", () => {
    const { config } = createPeerConfig({ VITE_TURN_URLS: "turn:a:3478,turn:b:3478" });

    expect(config.iceServers[1].urls).toEqual([
      "turn:a:3478",
      "turn:a:3478?transport=tcp",
      "turn:b:3478",
      "turn:b:3478?transport=tcp",
    ]);
  });

  it("keeps an explicit transport and a TLS relay as written", () => {
    const { config } = createPeerConfig({
      VITE_TURN_URLS: "turn:a:3478?transport=udp,turns:b:5349",
    });

    expect(config.iceServers[1].urls).toEqual([
      "turn:a:3478?transport=udp",
      "turns:b:5349",
    ]);
  });

  it("omits credentials when none are configured and honours a custom STUN", () => {
    const { config } = createPeerConfig({
      VITE_TURN_URLS: "turn:a:3478",
      VITE_STUN_URLS: "stun:stun.example.com:3478",
    });

    expect(config.iceServers[0]).toEqual({ urls: ["stun:stun.example.com:3478"] });
    expect(config.iceServers[1]).not.toHaveProperty("username");
    expect(config.iceServers[1]).not.toHaveProperty("credential");
  });
});

describe("createPeer", () => {
  afterEach(() => {
    peerConstructor.mockClear();
    vi.unstubAllEnvs();
  });

  it("claims the given id with the configured ICE servers", () => {
    vi.stubEnv("VITE_TURN_URLS", "turn:turn.example.com:3478");

    createPeer("photobooth-abc");

    expect(peerConstructor).toHaveBeenCalledWith("photobooth-abc", {
      config: { iceServers: expect.any(Array) },
    });
  });

  it("asks the broker for an id when joining a room", () => {
    createPeer();

    expect(peerConstructor).toHaveBeenCalledWith({});
  });
});
