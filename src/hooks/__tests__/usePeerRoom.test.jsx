import { act, fireEvent, render, screen } from "@testing-library/react";

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
      <span data-testid="connected">{String(room.connected)}</span>
    </>
  );
}

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
