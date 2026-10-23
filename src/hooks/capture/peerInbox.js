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
 * Applies the host dismissing an unsaved preview ("Take another"). Guests
 * close the dialog only if they are still showing that capture's preview —
 * a clear for another, older capture must not close a newer one, and a saved
 * photo is never dismissed. The sentinel revision keeps an in-flight preview
 * revision of the dismissed capture from re-opening the dialog.
 */
export function applyIncomingPhotoClear(captureId, session) {
  const received = session.receivedPhotoRef.current;
  if (!received || received.captureId !== captureId || received.saved) return;
  session.receivedPhotoRef.current = {
    captureId,
    revision: Number.MAX_SAFE_INTEGER,
    saved: false,
  };
  session.setCountdown(null);
  session.setShotNumber(0);
  session.setPhotoDataUrl("");
  session.setCanCustomizePreview(false);
  session.clearSources();
  session.setPhotoPending(false);
  session.setShowPreview(false);
}

/**
 * Applies an incoming photo revision. Later revisions of the same capture win;
 * once a capture's saved photo has arrived it is final, so no late preview or
 * duplicate save can replace it. Guests cannot customize, so photos only arrive
 * as screenshots of the host's choices. A `cleared` message dismisses instead.
 */
export function applyIncomingPhoto(photo, session) {
  if (photo?.cleared) {
    applyIncomingPhotoClear(photo.captureId, session);
    return;
  }
  session.setCountdown(null);
  session.setShotNumber(0);
  const captureId = photo.captureId || photo.id;
  const revision = Number.isInteger(photo.revision) ? photo.revision : 0;
  const received = session.receivedPhotoRef.current;
  if (received?.captureId === captureId) {
    // The saved photo ends the capture: nothing may overwrite it afterwards.
    if (received.saved) return;
    // Previews only ever advance. A duplicate or out-of-order revision must
    // not replace a newer frame/layout the guest is already showing. A save,
    // however, always beats every preview that came before it.
    if (photo.preview && revision <= received.revision) return;
  }
  if (!photo.preview) {
    session.addPhoto(photo.dataUrl, photo.frame, photo.layout || session.layout);
  }
  if (typeof photo.eventName === "string") session.updateEventName(photo.eventName);
  session.receivedPhotoRef.current = { captureId, revision, saved: !photo.preview };
  session.setPhotoDataUrl(photo.dataUrl);
  session.setSelectedFrame(photo.frame ?? session.frame);
  session.setSelectedLayout(photo.layout || session.layout);
  session.setCanCustomizePreview(false);
  session.clearSources();
  session.setPhotoPending(photo.preview === true);
  session.setShowPreview(true);
}