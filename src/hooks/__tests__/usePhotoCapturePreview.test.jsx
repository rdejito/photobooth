import { act, render, screen } from "@testing-library/react";
const { getVideoElementsMock, renderPhotoMock, broadcastPhotoMock } = vi.hoisted(() => ({
  getVideoElementsMock: vi.fn(),
  renderPhotoMock: vi.fn(),
  broadcastPhotoMock: vi.fn(),
}));
vi.mock("../../rendering/PhotoRenderer.js", () => ({
  renderPhoto: renderPhotoMock,
}));
import { usePhotoCapture } from "../usePhotoCapture.js";

const fakeCanvas = { getContext: () => ({}) };
const canvasRef = { current: fakeCanvas };

/**
 * Focused harness for the host/guest preview-dismissal flow. The capture
 * sequence itself is covered by usePhotoCapture.test.jsx.
 */
function Harness() {
  const capture = usePhotoCapture({
    getVideoElements: getVideoElementsMock,
    canvasRef,
    addPhoto: () => ({ id: "saved" }),
    setCallStatus: () => {},
    canCapture: true,
    expectedParticipantCount: 2,
    broadcastPhoto: broadcastPhotoMock,
    broadcastCountdown: () => {},
  });

  return (
    <>
      <button type="button" onClick={capture.takePhoto}>take-photo</button>
      <button type="button" onClick={capture.savePhoto}>save-photo</button>
      <button type="button" onClick={capture.hidePreview}>hide-preview</button>
      <button
        type="button"
        onClick={() =>
          capture.receivePhoto({
            id: "cap-0",
            captureId: "cap",
            revision: 0,
            preview: true,
            dataUrl: "data:image/png;base64,host-preview",
            frame: "classic",
            layout: "single-horizontal",
            eventName: "",
          })
        }
      >
        receive-preview
      </button>
      <button
        type="button"
        onClick={() => capture.receivePhoto({ cleared: true, captureId: "cap" })}
      >
        receive-clear
      </button>
      <span data-testid="show-preview">{String(capture.showPreview)}</span>
      <span data-testid="pending">{String(capture.photoPending)}</span>
      <span data-testid="customize">{String(capture.canCustomizePreview)}</span>
      <span data-testid="photo-data">{capture.photoDataUrl}</span>
    </>
  );
}

const clearCalls = () =>
  broadcastPhotoMock.mock.calls.filter(([message]) => message?.cleared === true);

async function captureBurst() {
  await act(async () => {
    screen.getByRole("button", { name: "take-photo" }).click();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
}

describe("usePhotoCapture preview dismissal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    canvasRef.current = fakeCanvas;
    broadcastPhotoMock.mockClear();
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
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockImplementation(() => "data:image/png;base64,burst-shot");
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("broadcasts a clear when the host dismisses an unsaved preview", async () => {
    render(<Harness />);
    await captureBurst();

    expect(screen.getByTestId("show-preview")).toHaveTextContent("true");
    expect(clearCalls()).toHaveLength(0);

    await act(async () => {
      screen.getByRole("button", { name: "hide-preview" }).click();
    });

    expect(screen.getByTestId("show-preview")).toHaveTextContent("false");
    expect(clearCalls()).toHaveLength(1);
    expect(clearCalls()[0][0]).toMatchObject({
      cleared: true,
      captureId: expect.any(String),
    });
  });

  it("does not broadcast a clear once the photo has been saved", async () => {
    render(<Harness />);
    await captureBurst();

    await act(async () => {
      screen.getByRole("button", { name: "save-photo" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "hide-preview" }).click();
    });

    expect(clearCalls()).toHaveLength(0);
  });

  it("releases the burst snapshots when the host dismisses the preview", async () => {
    render(<Harness />);
    await captureBurst();
    const [{ burstShots }] = renderPhotoMock.mock.calls[0];

    await act(async () => {
      screen.getByRole("button", { name: "hide-preview" }).click();
    });

    expect(
      burstShots.flat().map(({ video }) => [video.width, video.height]),
    ).toEqual(Array.from({ length: 8 }, () => [0, 0]));
  });

  it("closes a guest preview when the host's clear arrives", async () => {
    render(<Harness />);

    await act(async () => {
      screen.getByRole("button", { name: "receive-preview" }).click();
    });
    expect(screen.getByTestId("show-preview")).toHaveTextContent("true");
    expect(screen.getByTestId("pending")).toHaveTextContent("true");

    await act(async () => {
      screen.getByRole("button", { name: "receive-clear" }).click();
    });

    expect(screen.getByTestId("show-preview")).toHaveTextContent("false");
    expect(screen.getByTestId("pending")).toHaveTextContent("false");
    expect(screen.getByTestId("photo-data")).toHaveTextContent("");
  });
});
