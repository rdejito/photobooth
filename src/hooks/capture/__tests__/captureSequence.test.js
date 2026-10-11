import { PhotoCaptureSequence } from "../captureSequence.js";
import { PHOTO_SHOT_COUNT } from "../../../lib/constants.js";

function makeContext() {
  return {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  };
}

function readyVideo() {
  return { videoWidth: 320, videoHeight: 240, readyState: 4 };
}

function readyParticipant() {
  return { video: readyVideo(), label: "A" };
}

describe("PhotoCaptureSequence", () => {
  let context;

  beforeEach(() => {
    vi.useFakeTimers();
    context = makeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("counts down, snapshots and flashes four times, then finishes the burst", async () => {
    const handlers = {
      getVideoElements: vi.fn(() => [readyParticipant(), readyParticipant()]),
      expectedParticipantCount: 2,
      onCountdown: vi.fn(),
      onFlash: vi.fn(),
      onPaused: vi.fn(),
      onFinished: vi.fn(),
      onAbort: vi.fn(),
    };
    const sequence = new PhotoCaptureSequence(handlers);

    sequence.start();

    // The first countdown digit is announced synchronously.
    expect(handlers.onCountdown).toHaveBeenCalledWith(3, 1);

    // Three seconds in, the first shot's snapshot and flash fire.
    await vi.advanceTimersByTimeAsync(3000);
    expect(handlers.getVideoElements).toHaveBeenCalledTimes(1);
    expect(handlers.onFlash).toHaveBeenCalledTimes(1);

    // Run the rest of the burst; every shot snapshots both participants.
    await vi.advanceTimersByTimeAsync(30000);
    expect(handlers.onFlash).toHaveBeenCalledTimes(4);
    expect(handlers.onCountdown).toHaveBeenCalledWith(3, 2);
    expect(handlers.onCountdown).toHaveBeenCalledWith(3, 4);

    const [burstShots] = handlers.onFinished.mock.calls[0];
    expect(burstShots).toHaveLength(PHOTO_SHOT_COUNT);
    expect(burstShots.every((shots) => shots.length === 2)).toBe(true);
    expect(
      burstShots
        .flat()
        .every(({ video }) => video.width === 320 && video.height === 240),
    ).toBe(true);
    expect(handlers.onAbort).not.toHaveBeenCalled();
  });

  it("ignores a second start() while a burst is already running", () => {
    const handlers = { getVideoElements: vi.fn(), expectedParticipantCount: 0, onCountdown: vi.fn(), onFlash: vi.fn(), onPaused: vi.fn(), onFinished: vi.fn(), onAbort: vi.fn() };
    const sequence = new PhotoCaptureSequence(handlers);

    sequence.start();
    sequence.start();

    expect(handlers.onCountdown).toHaveBeenCalledTimes(1);
    expect(handlers.getVideoElements).not.toHaveBeenCalled();
  });

  it("aborts and unwinds all timers when a camera stops delivering frames", async () => {
    const handlers = {
      getVideoElements: vi.fn(() => [
        { video: { videoWidth: 0, videoHeight: 0, readyState: 0 }, label: "A" },
        readyParticipant(),
      ]),
      expectedParticipantCount: 2,
      onCountdown: vi.fn(),
      onFlash: vi.fn(),
      onPaused: vi.fn(),
      onFinished: vi.fn(),
      onAbort: vi.fn(),
    };
    const sequence = new PhotoCaptureSequence(handlers);

    sequence.start();
    await vi.advanceTimersByTimeAsync(4000);

    expect(handlers.onAbort).toHaveBeenCalledWith(
      "A camera preview is not ready for capture.",
    );
    expect(handlers.onFinished).not.toHaveBeenCalled();
    expect(sequence.inProgress).toBe(false);

    // Nothing else ticks after the abort: the countdown is fully unwound.
    const countdownCallsAfterAbort = handlers.onCountdown.mock.calls.length;
    await vi.advanceTimersByTimeAsync(20000);
    expect(handlers.onCountdown.mock.calls.length).toBe(countdownCallsAfterAbort);
  });
});