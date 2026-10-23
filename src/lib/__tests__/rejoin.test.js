import {
  clearRejoinSession,
  createDeviceId,
  readRejoinSession,
  saveRejoinSession,
} from "../rejoin.js";

describe("rejoin session persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips the room, device id and host-issued rejoin token", () => {
    saveRejoinSession("GEMS22", "device-1", "token-1");
    expect(readRejoinSession()).toEqual({
      room: "GEMS22",
      deviceId: "device-1",
      rejoinToken: "token-1",
    });
  });

  it("returns a null token when none has been issued yet", () => {
    saveRejoinSession("GEMS22", "device-1");
    expect(readRejoinSession()).toEqual({
      room: "GEMS22",
      deviceId: "device-1",
      rejoinToken: null,
    });
  });

  it("returns null when nothing is stored or the payload is corrupt", () => {
    expect(readRejoinSession()).toBeNull();
    localStorage.setItem("photobooth.rejoin", "{not json");
    expect(readRejoinSession()).toBeNull();
  });

  it("normalizes the room code and rejects an empty or oversized one", () => {
    saveRejoinSession("  gems22  ", "device-1");
    expect(readRejoinSession()).toEqual({
      room: "GEMS22",
      deviceId: "device-1",
      rejoinToken: null,
    });

    localStorage.setItem(
      "photobooth.rejoin",
      JSON.stringify({ room: "TOOLONGROOMCODE", deviceId: "x" }),
    );
    expect(readRejoinSession()).toBeNull();
  });

  it("strips characters a room code cannot contain instead of discarding the session", () => {
    saveRejoinSession("GEMS-2", "device-1");
    expect(readRejoinSession()).toEqual({
      room: "GEMS2",
      deviceId: "device-1",
      rejoinToken: null,
    });

    // A payload left by an older client is repaired on read, not rejected.
    localStorage.setItem(
      "photobooth.rejoin",
      JSON.stringify({ room: "gem s!2", deviceId: "x" }),
    );
    expect(readRejoinSession()).toEqual({
      room: "GEMS2",
      deviceId: "x",
      rejoinToken: null,
    });
  });

  it("clears the stored room on demand", () => {
    saveRejoinSession("GEMS22", "device-1");
    clearRejoinSession();
    expect(readRejoinSession()).toBeNull();
  });
});

describe("createDeviceId", () => {
  it("produces a non-empty, unique id", () => {
    const first = createDeviceId();
    const second = createDeviceId();
    expect(first).toMatch(/^[a-z0-9]+$/);
    expect(first).not.toBe(second);
  });
});
