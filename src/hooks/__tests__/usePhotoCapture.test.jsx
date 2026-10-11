import { act, render, screen } from "@testing-library/react";
const { getVideoElementsMock, renderPhotoMock, broadcastCountdownMock } = vi.hoisted(() => ({
  getVideoElementsMock: vi.fn(),
  renderPhotoMock: vi.fn(),
  broadcastCountdownMock: vi.fn(),
}));
vi.mock("../../rendering/PhotoRenderer.js", () => ({
  renderPhoto: renderPhotoMock,
}));
import { usePhotoCapture } from "../usePhotoCapture.js";

function CaptureHarness() {
  const capture = usePhotoCapture({
    getVideoElements: getVideoElementsMock,
    canvasRef: {
      current: {
        getContext: () => ({
          clearRect: () => {},
          fillRect: () => {},
          drawImage: () => {},
        }),
        toDataURL: () => "data:image/png;base64,burst-shot",
      },
    },
    addPhoto: () => ({ id: "saved" }),
    setCallStatus: () => {},
    canCapture: true,
    expectedParticipantCount: 2,
    broadcastPhoto: () => {},
    broadcastCountdown: broadcastCountdownMock,
  });

  return (
    <>
      <button type="button" onClick={capture.takePhoto}>take-photo</button>
      <button type="button" onClick={() => capture.setFrame("polaroid")}>change-frame</button>
      <button type="button" onClick={() => capture.setLayout("grid-2x2")}>change-layout</button>
      <span data-testid="photo-data">{capture.photoDataUrl}</span>
      <span data-testid="customize">{String(capture.canCustomizePreview)}</span>
      <span data-testid="pending">{String(capture.photoPending)}</span>
      <span data-testid="shot">{capture.shotNumber}</span>
      <span data-testid="flash">{String(capture.showFlash)}</span>
    </>
  );
}

describe("usePhotoCapture", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    broadcastCountdownMock.mockClear();
    getVideoElementsMock.mockReturnValue([
      { video: { videoWidth: 320, videoHeight: 240, readyState: 4 }, label: "A" },
      { video: { videoWidth: 320, videoHeight: 240, readyState: 4 }, label: "B" },
    ]);
    renderPhotoMock.mockImplementation(() => "data:image/png;base64,composite");
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => ({
      clearRect: () => {},
      fillRect: () => {},
      drawImage: () => {},
      fillText: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arcTo: () => {},
      arc: () => {},
      closePath: () => {},
      clip: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      fill: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillStyle: "",
      font: "",
      textAlign: "",
      setTransform: () => {},
      canvas: { width: 0, height: 0 },
    }));
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => {
      return "data:image/png;base64,burst-shot";
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("repeats the countdown and flash until four shots compose the photo", async () => {
    render(<CaptureHarness />);

    await act(async () => {
      screen.getByRole("button", { name: "take-photo" }).click();
    });

    expect(screen.getByTestId("customize")).toHaveTextContent("false");
    expect(screen.getByTestId("pending")).toHaveTextContent("true");

    // The first countdown reaches its capture moment three seconds in.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(screen.getByTestId("shot")).toHaveTextContent("1");
    expect(screen.getByTestId("flash")).toHaveTextContent("true");
    expect(getVideoElementsMock).toHaveBeenCalledTimes(1);

    // Run the rest of the four-shot sequence and the final composition.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    expect(screen.getByTestId("photo-data")).toHaveTextContent("data:image/png;base64,composite");
    expect(screen.getByTestId("customize")).toHaveTextContent("true");
    expect(screen.getByTestId("pending")).toHaveTextContent("false");
    expect(renderPhotoMock).toHaveBeenCalledOnce();
    const [{ burstShots }] = renderPhotoMock.mock.calls[0];
    expect(burstShots).toHaveLength(4);
    expect(burstShots.every((shot) => shot.length === 2)).toBe(true);
    expect(burstShots.flat().every(({ video }) => video.width === 320 && video.height === 240)).toBe(true);

    const countedThrees = broadcastCountdownMock.mock.calls.filter(([value]) => value === 3);
    const flashes = broadcastCountdownMock.mock.calls.filter(([value]) => value === "📸");
    expect(countedThrees).toHaveLength(4);
    expect(flashes).toHaveLength(4);
    expect(flashes.map(([, meta]) => meta.shot)).toEqual([1, 2, 3, 4]);

    await act(async () => {
      screen.getByRole("button", { name: "change-frame" }).click();
      screen.getByRole("button", { name: "change-layout" }).click();
    });

    expect(renderPhotoMock).toHaveBeenCalledTimes(3);
    expect(
      renderPhotoMock.mock.calls.slice(1).every(([options]) => options.burstShots.length === 4),
    ).toBe(true);
  });

  it("stops the sequence and resets when a camera drops on a later shot", async () => {
    render(<CaptureHarness />);
    getVideoElementsMock.mockImplementation(() => {
      const callCount = getVideoElementsMock.mock.calls.length;
      return callCount >= 1
        ? [
            { video: { videoWidth: 0, videoHeight: 0, readyState: 0 }, label: "A" },
            { video: { videoWidth: 320, videoHeight: 240, readyState: 4 }, label: "B" },
          ]
        : [
            { video: { videoWidth: 320, videoHeight: 240, readyState: 4 }, label: "A" },
            { video: { videoWidth: 320, videoHeight: 240, readyState: 4 }, label: "B" },
          ];
    });

    await act(async () => {
      screen.getByRole("button", { name: "take-photo" }).click();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    expect(renderPhotoMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("pending")).toHaveTextContent("false");
    expect(screen.getByTestId("customize")).toHaveTextContent("false");
    expect(screen.getByTestId("shot")).toHaveTextContent("0");
  });
});
