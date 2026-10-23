/**
 * Host-side photo composition.
 *
 * Where peerInbox handles *incoming* messages, this module handles the host's
 * *outgoing* workflow: composing the finished burst, re-composing it while the
 * host tweaks frame/layout, and saving the final photo. All three share the
 * canvas render + broadcast-revision pattern, so they live together and get
 * the same small "session" API the peerInbox helpers use.
 */
import { composePhoto } from "./photoComposer.js";
import { publishPhotoMessage } from "./previewPublisher.js";

/**
 * Composes the finished burst into the preview dialog and broadcasts it as the
 * first (revision 0) preview message. Also arms the host's editor state.
 */
export async function completeCapture(session, shots) {
  const {
    sequence, canvasRef, broadcastPhoto, frame, layout, eventNameRef,
    setCallStatus, setCountdown, setShotNumber, broadcastCountdown,
    abortCapture, setPhotoPending, setPhotoDataUrl, setCanCustomizePreview,
    setShowPreview, sourceParticipantsRef, sourceBurstParticipantsRef,
    captureIdRef, photoRevisionRef, photoSavedRef,
  } = session;

  sequence.clearTimers();
  setCountdown(null);
  setShotNumber(0);
  broadcastCountdown(null);
  try {
    const result = await composePhoto(canvasRef, {
      burstShots: shots,
      frame,
      layout,
      frameOptions: { eventName: eventNameRef.current },
    });
    if (result.error) {
      if (result.error === "missing-canvas") {
        sequence.inProgress = false;
        abortCapture("Couldn't take photo — canvas not ready, try again.");
        return;
      }
      throw result.error;
    }
    const dataUrl = result.dataUrl;
    sourceParticipantsRef.current = [];
    sourceBurstParticipantsRef.current = shots;
    captureIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    photoRevisionRef.current = 0;
    setPhotoPending(false);
    setPhotoDataUrl(dataUrl);
    photoSavedRef.current = false;
    setCanCustomizePreview(true);
    sequence.inProgress = false;
    setShowPreview(true);
    publishPhotoMessage(broadcastPhoto, {
      captureId: captureIdRef.current,
      revision: 0,
      preview: true,
      dataUrl,
      frame,
      layout,
      eventName: eventNameRef.current,
    });
  } catch (error) {
    console.error("Failed to capture photo:", error);
    setPhotoPending(false);
    sequence.inProgress = false;
    setCallStatus(
      "Something went wrong taking the photo — check the console and try again.",
    );
  }
}

/**
 * Re-renders the pending photo with a new frame (`nextFrame`) or layout
 * (`nextLayout`) and broadcasts the updated preview revision. Shared by the
 * frame and layout pickers.
 */
export async function recomposePhoto(session, { nextFrame, nextLayout, logLabel, failStatus }) {
  const {
    canvasRef, broadcastPhoto, frame, layout, eventNameRef,
    canCustomizePreview, photoDataUrl, setCallStatus, setPhotoDataUrl,
    setSelectedFrame, setSelectedLayout, sourceParticipantsRef,
    sourceBurstParticipantsRef, captureIdRef, photoRevisionRef,
    recomposeRequestRef,
  } = session;

  const hasSource =
    sourceParticipantsRef.current.length > 0 ||
    sourceBurstParticipantsRef.current.length > 0;
  if (
    !canCustomizePreview ||
    (nextFrame && !hasSource) ||
    (nextLayout && !photoDataUrl)
  ) {
    return;
  }
  const requestId = (recomposeRequestRef.current += 1);
  try {
    const result = await composePhoto(canvasRef, {
      participants: sourceParticipantsRef.current,
      burstShots: sourceBurstParticipantsRef.current.length
        ? sourceBurstParticipantsRef.current
        : undefined,
      frame: nextFrame || frame,
      layout: nextLayout || layout,
      frameOptions: { eventName: eventNameRef.current },
    });
    if (requestId !== recomposeRequestRef.current) return;
    if (result.error) {
      if (result.error === "missing-canvas") {
        setCallStatus("Couldn't update the photo — canvas not ready, try again.");
        return;
      }
      throw result.error;
    }
    const dataUrl = result.dataUrl;
    if (nextFrame) setSelectedFrame(nextFrame);
    else setSelectedLayout(nextLayout);
    setPhotoDataUrl(dataUrl);
    photoRevisionRef.current += 1;
    publishPhotoMessage(broadcastPhoto, {
      captureId: captureIdRef.current,
      revision: photoRevisionRef.current,
      preview: true,
      dataUrl,
      frame: nextFrame || frame,
      layout: nextLayout || layout,
      eventName: eventNameRef.current,
    });
  } catch (error) {
    if (requestId !== recomposeRequestRef.current) return;
    console.error(logLabel, error);
    setCallStatus(failStatus);
  }
}

/**
 * Saves the host's final composition to the gallery and broadcasts it as the
 * non-preview revision that guests persist and can never be beaten by an
 * earlier preview.
 */
export function saveCapturedPhoto(session) {
  const {
    broadcastPhoto, frame, layout, eventNameRef, canCustomizePreview,
    photoSavedRef, photoDataUrl, addPhoto, setCanCustomizePreview,
    sourceParticipantsRef, sourceBurstParticipantsRef, captureIdRef,
    photoRevisionRef,
  } = session;

  if (!canCustomizePreview || photoSavedRef.current || !photoDataUrl) return;
  addPhoto(photoDataUrl, frame, layout);
  photoRevisionRef.current += 1;
  publishPhotoMessage(broadcastPhoto, {
    captureId: captureIdRef.current,
    revision: photoRevisionRef.current,
    preview: false,
    dataUrl: photoDataUrl,
    frame,
    layout,
    eventName: eventNameRef.current,
  });
  photoSavedRef.current = true;
  sourceParticipantsRef.current = [];
  sourceBurstParticipantsRef.current = [];
  setCanCustomizePreview(false);
}