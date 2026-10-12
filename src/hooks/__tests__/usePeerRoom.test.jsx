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

async function renderInRoom() {
  render(<Harness />);
  await act(async () => {
    fireEvent.click(screen.getByText("create-room"));
  });
}

const pushParticipants = (participants) =>
  act(() => sessionRef.current.options.onParticipants(participants));

describe("usePeerRoom page unload teardown", () => {
  beforeEach(() => {
    destroyMock.mockClear();
    startHostMock.mockClear();
    sessionRef.current = null;
    Object.defineProperty(window.navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(streamMock) },
    });
  });

  it("stops the session when the page is hidden for unload (tab close/reload)", async () => {
    await renderInRoom();
    expect(startHostMock).toHaveBeenCalled();

    fireEvent(window, new Event("pagehide"));

    expect(destroyMock).toHaveBeenCalledWith({ unload: true });
  });

  it("keeps the session alive when pagehide is only caching it (bfcache)", async () => {
    await renderInRoom();

    const event = new Event("pagehide");
    Object.defineProperty(event, "persisted", { value: true });
    fireEvent(window, event);

    expect(destroyMock).not.toHaveBeenCalled();
  });
});

describe("usePeerRoom connected state", () => {
  beforeEach(() => {
    destroyMock.mockClear();
    startHostMock.mockClear();
    sessionRef.current = null;
    Object.defineProperty(window.navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(streamMock) },
    });
  });

  const connected = () => screen.getByTestId("connected").textContent;

  it("is false until another participant's camera is live", async () => {
    await renderInRoom();

    await pushParticipants([
      { id: "self", local: true, stream: streamMock, connected: true },
      { id: "guest", local: false, stream: null, connected: true },
    ]);

    expect(connected()).toBe("false");
  });

  it("stays true while a peer is in its disconnect grace window", async () => {
    await renderInRoom();

    await pushParticipants([
      { id: "self", local: true, stream: streamMock, connected: true },
      { id: "guest", local: false, stream: null, connected: false },
    ]);

    expect(connected()).toBe("true");
  });
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
    expect(saved).toEqual({ room: "WXYZ", deviceId: expect.any(String) });
    expect(screen.getByTestId("room-code").textContent).toBe("WXYZ");
    expect(sessionRef.current.options.deviceId).toBe(saved.deviceId);
  });

  it("normalizes a typed code to the characters the room actually uses", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("join-odd-room"));
    });

    const saved = readRejoinSession();
    expect(saved).toEqual({ room: "WXYZ", deviceId: expect.any(String) });
    expect(screen.getByTestId("room-code").textContent).toBe("WXYZ");
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
