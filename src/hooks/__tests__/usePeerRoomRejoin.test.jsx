import { act, fireEvent, render, screen } from "@testing-library/react";
import { readRejoinSession, saveRejoinSession } from "../../lib/rejoin.js";

const { destroyMock, startHostMock, streamMock, sessionRef } = vi.hoisted(() => ({
  destroyMock: vi.fn(),
  startHostMock: vi.fn(),
  streamMock: { getTracks: () => [] },
  sessionRef: { current: null },
}));

vi.mock("../../services/PeerRoomSession.js", () => ({
  PeerRoomSession: class {
    constructor(options) {
      this.options = options;
      this.isHost = false;
      this.startHost = startHostMock;
      this.join = vi.fn();
      this.destroy = destroyMock;
      sessionRef.current = this;
    }
  },
}));

import { usePeerRoom } from "../usePeerRoom.js";

function Harness() {
  const room = usePeerRoom({ onPhoto: () => {}, onCountdown: () => {} });
  return (
    <>
      <button type="button" onClick={() => room.createRoom("ABCD", () => {})}>
        create-room
      </button>
      <button type="button" onClick={() => room.joinRoom("WXYZ")}>
        join-room
      </button>
      <button type="button" onClick={() => room.joinRoom("WX-YZ")}>
        join-odd-room
      </button>
      <button type="button" onClick={() => room.leaveRoom()}>
        leave-room
      </button>
      <span data-testid="connected">{String(room.connected)}</span>
      <span data-testid="room-code">{room.roomCode}</span>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("usePeerRoom rejoin persistence", () => {
  beforeEach(() => {
    destroyMock.mockClear();
    startHostMock.mockClear();
    sessionRef.current = null;
    Object.defineProperty(window.navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(streamMock) },
    });
  });

  it("remembers the room and this device's rejoin id when a guest joins", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("join-room"));
    });

    const saved = readRejoinSession();
    expect(saved).toEqual({
      room: "WXYZ",
      deviceId: expect.any(String),
      rejoinToken: null,
    });
    expect(screen.getByTestId("room-code").textContent).toBe("WXYZ");
    expect(sessionRef.current.options.deviceId).toBe(saved.deviceId);
    expect(sessionRef.current.options.rejoinToken).toBe(null);
  });

  it("normalizes a typed code to the characters the room actually uses", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("join-odd-room"));
    });

    const saved = readRejoinSession();
    expect(saved).toEqual({
      room: "WXYZ",
      deviceId: expect.any(String),
      rejoinToken: null,
    });
    expect(screen.getByTestId("room-code").textContent).toBe("WXYZ");
  });

  it("ignores a saved rejoin token that belongs to another room", async () => {
    saveRejoinSession("OTHER1", "device-7", "token-7");
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("join-room"));
    });

    const saved = readRejoinSession();
    expect(saved).toEqual({
      room: "WXYZ",
      deviceId: expect.any(String),
      rejoinToken: null,
    });
    expect(sessionRef.current.options.rejoinToken).toBe(null);
  });

  it("passes a saved rejoin token and persists a rotated one", async () => {
    saveRejoinSession("GEMS22", "device-9", "token-9");

    render(<Harness />);
    await act(async () => {});

    expect(sessionRef.current.options.rejoinToken).toBe("token-9");

    await act(() => {
      sessionRef.current.options.onRejoinToken("token-rotated");
    });

    expect(readRejoinSession()).toEqual({
      room: "GEMS22",
      deviceId: "device-9",
      rejoinToken: "token-rotated",
    });
  });

  it("clears the saved room on an explicit leave", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("join-room"));
    });
    expect(readRejoinSession()).not.toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByText("leave-room"));
    });

    expect(readRejoinSession()).toBeNull();
    expect(destroyMock).toHaveBeenCalled();
  });

  it("clears the saved room when the room closes", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("join-room"));
    });
    expect(readRejoinSession()).not.toBeNull();

    await act(() => {
      sessionRef.current.options.onRoomClosed();
    });

    expect(readRejoinSession()).toBeNull();
    expect(screen.getByTestId("room-code").textContent).toBe("");
    expect(destroyMock).toHaveBeenCalled();
  });

  it("clears the saved room when the connection fails", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("join-room"));
    });
    expect(readRejoinSession()).not.toBeNull();

    await act(() => {
      sessionRef.current.options.onConnectionFailed("Couldn't find that room.");
    });

    expect(readRejoinSession()).toBeNull();
    expect(screen.getByTestId("room-code").textContent).toBe("");
    expect(destroyMock).toHaveBeenCalled();
  });

  it("automatically rejoins the saved room on mount", async () => {
    saveRejoinSession("GEMS22", "device-9");

    render(<Harness />);
    await act(async () => {});

    expect(screen.getByTestId("room-code").textContent).toBe("GEMS22");
    expect(sessionRef.current.options.deviceId).toBe("device-9");
    expect(sessionRef.current.join).toHaveBeenCalledWith("GEMS22");
  });
});
