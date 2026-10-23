/**
 * The four-shot capture sequence: a small state machine that owns the countdown
 * ticks, the inter-shot pauses and every timeout used during a burst, so a
 * capture can be unwound cleanly (cancel / abort / unmount).
 *
 * All presentation is delegated to a `handlers` object that the hook re-binds
 * every render, so this module stays DOM- and React-free and can be unit-tested
 * purely with fake timers and fake canvases.
 */
import { PHOTO_SHOT_COUNT } from "../../lib/constants.js";

/** Seconds the countdown starts from, and the flash marker shown at the shot. */
export const COUNTDOWN_FROM = 3;
export const CAPTURE_MOMENT = "📸";
export const COUNTDOWN_TICK_MS = 1000;
export const INTER_SHOT_DELAY_MS = 3000;
export const FLASH_DURATION_MS = 400;

export class PhotoCaptureSequence {
  /**
   * @param {object} handlers - Re-bindable callbacks (see `bind`).
   */
  constructor(handlers) {
    this.handlers = handlers;
    this.timers = new Set();
    this.inProgress = false;
  }

  /**
   * Refresh the callbacks and capture parameters. Called from the hook render
   * so `expectedParticipantCount` and `getVideoElements` always reflect the
   * latest room state when a shot fires.
   */
  bind(nextHandlers) {
    Object.assign(this.handlers, nextHandlers);
  }

  /** Tracks a timer so `clearTimers` can unwind the whole burst. */
  schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  /** Cancels every pending timer in the burst. */
  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  /**
   * Captures every participant into offscreen canvases. Mirrors each live
   * video frame exactly (no cover-crop yet — slots crop later) and fails hard
   * if a camera isn't actually delivering frames.
   */
  snapshotParticipants() {
    const participants = this.handlers.getVideoElements();
    if (participants.length !== this.handlers.expectedParticipantCount) {
      throw new Error(
        "Wait until every camera preview is ready before taking the group photo.",
      );
    }
    return participants.map(({ video, label }) => {
      if (!(video?.videoWidth > 0 && video?.videoHeight > 0 && video.readyState >= 2)) {
        throw new Error("A camera preview is not ready for capture.");
      }
      const snapshot = document.createElement("canvas");
      snapshot.width = video.videoWidth;
      snapshot.height = video.videoHeight;
      const snapshotContext = snapshot.getContext("2d");
      if (!snapshotContext) {
        throw new Error("Canvas rendering context is unavailable.");
      }
      snapshotContext.drawImage(video, 0, 0);
      return { video: snapshot, label };
    });
  }

  /**
   * One shot: count 3 → 2 → 1 → flash, snapshot at the flash, then pause
   * before the next shot or compose the finished burst.
   */
  runShot(shotIndex, shots) {
    const shot = shotIndex + 1;
    let seconds = COUNTDOWN_FROM;
    this.handlers.onCountdown(seconds, shot);

    const tick = () => {
      seconds -= 1;
      if (seconds > 0) {
        this.handlers.onCountdown(seconds, shot);
        this.schedule(tick, COUNTDOWN_TICK_MS);
        return;
      }

      this.handlers.onCountdown(CAPTURE_MOMENT, shot);
      let snapshots;
      try {
        snapshots = this.snapshotParticipants();
      } catch (error) {
        this.abort(error.message);
        return;
      }
      shots.push(snapshots);
      this.handlers.onFlash();

      this.schedule(() => {
        // Pause: clear the countdown, then continue the burst or finish.
        this.handlers.onPaused();
        if (shotIndex + 1 < PHOTO_SHOT_COUNT) {
          this.schedule(
            () => this.runShot(shotIndex + 1, shots),
            INTER_SHOT_DELAY_MS,
          );
          return;
        }
        this.handlers.onFinished(shots);
      }, FLASH_DURATION_MS);
    };

    this.schedule(tick, COUNTDOWN_TICK_MS);
  }

  /** Starts the burst. No-op while a capture is already in progress. */
  start() {
    if (this.inProgress) return;
    this.inProgress = true;
    this.clearTimers();
    this.runShot(0, []);
  }

  /** Aborts a burst: unwinds timers, flags the failure, resets state. */
  abort(message) {
    this.clearTimers();
    this.inProgress = false;
    this.handlers.onAbort(message);
  }
}

/**
 * Releases a finished burst's snapshot canvases. The host keeps them for
 * frame/layout recompose, so callers invoke this only when a capture is saved
 * or dismissed.
 */
export function releaseSnapshotCanvases(shots = []) {
  for (const shot of shots) {
    for (const participant of shot || []) {
      const canvas = participant?.video;
      if (!canvas) continue;
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}