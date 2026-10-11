/**
 * Peer inbox — the guest side of countdown and photo messaging.
 *
 * The host broadcasts countdown ticks, flash moments and every photo revision;
 * guests apply them through the small "session" API below. Keeping these as
 * pure helpers (instead of inline in usePhotoCapture) keeps the hook focused on
 * the host's capture flow and lets the dedupe/revision logic be tested alone.
 */
import { CAPTURE_MOMENT } from "./captureSequence.js";

/** Applies an incoming countdown value; the flash moment also flashes locally. */
export function applyIncomingCountdown(value, meta, session) {
  if (value === CAPTURE_MOMENT) session.triggerFlash();
  session.setCountdown(value);
  session.setShotNumber(
    value === null || !Number.isInteger(meta?.shot) ? 0 : meta.shot,
  );
}

/**
 * Applies an incoming photo revision. Later revisions of the same capture win;
 * a saved photo always beats any preview of the same revision. Guests cannot
 * customize, so pics only arrive as screenshots of the host's choices.
 */
export function applyIncomingPhoto(photo, session) {
  session.setCountdown(null);
  session.setShotNumber(0);
  const captureId = photo.captureId || photo.id;
  const revision = Number.isInteger(photo.revision) ? photo.revision : 0;
  const received = session.receivedPhotoRef.current;
  if (
    received?.captureId === captureId &&
    (revision < received.revision ||
      (!photo.preview && received.saved && revision <= received.revision))
  ) {
    return;
  }
  if (!photo.preview) {
    session.addPhoto(photo.dataUrl, photo.frame, photo.layout || session.layout);
  }
  if (typeof photo.eventName === "string") session.updateEventName(photo.eventName);
  session.receivedPhotoRef.current = { captureId, revision, saved: !photo.preview };
  session.setPhotoDataUrl(photo.dataUrl);
  session.setSelectedFrame(photo.frame);
  session.setSelectedLayout(photo.layout || "single-horizontal");
  session.setCanCustomizePreview(false);
  session.clearSources();
  session.setPhotoPending(photo.preview === true);
  session.setShowPreview(true);
}