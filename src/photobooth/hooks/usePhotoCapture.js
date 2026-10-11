import { useEffect, useRef, useState } from "react";
import { renderPhoto } from "../rendering/PhotoRenderer.js";
import { loadFrameFonts } from "../rendering/frameFonts.js";
import { PHOTO_SHOT_COUNT } from "../constants.js";

const COUNTDOWN_FROM = 3;
const COUNTDOWN_TICK_MS = 1000;
const INTER_SHOT_DELAY_MS = 3000;
const FLASH_DURATION_MS = 400;
const CAPTURE_MOMENT = "📸";

/**
 * Renders a photo, first awaiting the fonts the chosen frame uses so Canvas
 * text never silently falls back to the wrong typeface.
 */
async function renderPhotoWithFonts(options) {
  await loadFrameFonts(options.frame);
  return renderPhoto(options);
}

export function usePhotoCapture({
  getVideoElements,
  canvasRef,
  addPhoto,
  setCallStatus,
  canCapture,
  expectedParticipantCount,
  broadcastPhoto,
  broadcastCountdown,
}) {
  const [frame, setSelectedFrame] = useState("classic");
  const [layout, setSelectedLayout] = useState("single-horizontal");
  const [eventName, setEventName] = useState("");
  const eventNameRef = useRef("");
  const [countdown, setCountdown] = useState(null);
  const [shotNumber, setShotNumber] = useState(0);
  const captureTimersRef = useRef(new Set());
  const captureInProgressRef = useRef(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [canCustomizePreview, setCanCustomizePreview] = useState(false);
  const [photoPending, setPhotoPending] = useState(false);
  const flashRef = useRef(null);
  const sourceParticipantsRef = useRef([]);
  const sourceBurstParticipantsRef = useRef([]);
  const photoSavedRef = useRef(false);
  const captureIdRef = useRef(null);
  const photoRevisionRef = useRef(0);
  const receivedPhotoRef = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(flashRef.current);
      captureTimersRef.current.forEach(clearTimeout);
      captureTimersRef.current.clear();
    },
    [],
  );

  const updateEventName = (value) => {
    eventNameRef.current = value;
    setEventName(value);
  };

  const clearCaptureTimers = () => {
    captureTimersRef.current.forEach(clearTimeout);
    captureTimersRef.current.clear();
  };

  // Every timer in a capture cycle is tracked so leaving the booth, canceling,
  // or unmounting can unwind the whole four-shot sequence cleanly.
  const scheduleCapture = (callback, delay) => {
    const timer = setTimeout(() => {
      captureTimersRef.current.delete(timer);
      callback();
    }, delay);
    captureTimersRef.current.add(timer);
    return timer;
  };

  const triggerFlash = () => {
    setShowFlash(true);
    clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setShowFlash(false), FLASH_DURATION_MS);
  };

  const broadcastShot = (value, shot) => {
    broadcastCountdown(value, { shot, total: PHOTO_SHOT_COUNT });
  };

  const abortCapture = (message) => {
    if (message) setCallStatus(message);
    clearCaptureTimers();
    clearTimeout(flashRef.current);
    captureInProgressRef.current = false;
    setPhotoPending(false);
    setShowFlash(false);
    setCountdown(null);
    setShotNumber(0);
    broadcastCountdown(null);
  };

  const snapshotParticipants = () => {
    const participants = getVideoElements();
    if (participants.length !== expectedParticipantCount) {
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
  };

  const finishCapture = async (shots) => {
    clearCaptureTimers();
    setCountdown(null);
    setShotNumber(0);
    broadcastCountdown(null);
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        abortCapture("Couldn't take photo — canvas not ready, try again.");
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering context is unavailable.");

      const dataUrl = await renderPhotoWithFonts({
        canvas,
        context,
        burstShots: shots,
        frame,
        layout,
        frameOptions: { eventName: eventNameRef.current },
      });
      sourceParticipantsRef.current = [];
      sourceBurstParticipantsRef.current = shots;
      captureIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      photoRevisionRef.current = 0;
      setPhotoPending(false);
      setPhotoDataUrl(dataUrl);
      photoSavedRef.current = false;
      setCanCustomizePreview(true);
      captureInProgressRef.current = false;
      setShowPreview(true);
      broadcastPhoto({
        id: `${captureIdRef.current}-0`,
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
      captureInProgressRef.current = false;
      setCallStatus(
        "Something went wrong taking the photo — check the console and try again.",
      );
    }
  };

  // One shot of the sequence: count 3 → 2 → 1 → flash, grab a snapshot at the
  // flash, then either pause and start the next shot or compose the result.
  const runShot = (shotIndex, shots) => {
    const shot = shotIndex + 1;
    setShotNumber(shot);
    let seconds = COUNTDOWN_FROM;
    setCountdown(seconds);
    broadcastShot(seconds, shot);

    const tick = () => {
      seconds -= 1;
      if (seconds > 0) {
        setCountdown(seconds);
        broadcastShot(seconds, shot);
        scheduleCapture(tick, COUNTDOWN_TICK_MS);
        return;
      }

      setCountdown(CAPTURE_MOMENT);
      broadcastShot(CAPTURE_MOMENT, shot);
      let snapshots;
      try {
        snapshots = snapshotParticipants();
      } catch (error) {
        abortCapture(error.message);
        return;
      }
      shots.push(snapshots);
      triggerFlash();

      scheduleCapture(() => {
        setCountdown(null);
        setShotNumber(0);
        broadcastCountdown(null);
        if (shotIndex + 1 < PHOTO_SHOT_COUNT) {
          scheduleCapture(
            () => runShot(shotIndex + 1, shots),
            INTER_SHOT_DELAY_MS,
          );
          return;
        }
        void finishCapture(shots);
      }, FLASH_DURATION_MS);
    };

    scheduleCapture(tick, COUNTDOWN_TICK_MS);
  };

  const takePhoto = () => {
    if (!canCapture || captureInProgressRef.current) return;
    captureInProgressRef.current = true;
    clearCaptureTimers();
    sourceBurstParticipantsRef.current = [];
    setPhotoPending(true);
    runShot(0, []);
  };

  const cancelCountdown = () => {
    clearCaptureTimers();
    clearTimeout(flashRef.current);
    captureInProgressRef.current = false;
    setShowFlash(false);
    setCountdown(null);
    setShotNumber(0);
    broadcastCountdown(null);
  };

  const receiveCountdown = (value, meta) => {
    if (value === CAPTURE_MOMENT) triggerFlash();
    setCountdown(value);
    setShotNumber(
      value === null || !Number.isInteger(meta?.shot) ? 0 : meta.shot,
    );
  };

  const receivePhoto = (photo) => {
    setCountdown(null);
    setShotNumber(0);
    const captureId = photo.captureId || photo.id;
    const revision = Number.isInteger(photo.revision) ? photo.revision : 0;
    const receivedPhoto = receivedPhotoRef.current;
    if (
      receivedPhoto?.captureId === captureId &&
      (revision < receivedPhoto.revision ||
        (!photo.preview && receivedPhoto.saved && revision <= receivedPhoto.revision))
    ) {
      return;
    }
    if (!photo.preview) addPhoto(photo.dataUrl, photo.frame, photo.layout || layout);
    if (typeof photo.eventName === "string") updateEventName(photo.eventName);
    receivedPhotoRef.current = {
      captureId,
      revision,
      saved: !photo.preview,
    };
    setPhotoDataUrl(photo.dataUrl);
    setSelectedFrame(photo.frame);
    setSelectedLayout(photo.layout || "single-horizontal");
    setCanCustomizePreview(false);
    sourceParticipantsRef.current = [];
    sourceBurstParticipantsRef.current = [];
    setPhotoPending(photo.preview === true);
    setShowPreview(true);
  };

  const selectFrame = async (nextFrame) => {
    if (
      !canCustomizePreview ||
      (!sourceParticipantsRef.current.length && !sourceBurstParticipantsRef.current.length)
    ) return;
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setCallStatus("Couldn't update the photo — canvas not ready, try again.");
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering context is unavailable.");
      const dataUrl = await renderPhotoWithFonts({
        canvas,
        context,
        participants: sourceParticipantsRef.current,
        burstShots: sourceBurstParticipantsRef.current.length
          ? sourceBurstParticipantsRef.current
          : undefined,
        frame: nextFrame,
        layout,
        frameOptions: { eventName: eventNameRef.current },
      });
      setSelectedFrame(nextFrame);
      setPhotoDataUrl(dataUrl);
      photoRevisionRef.current += 1;
      broadcastPhoto({
        id: `${captureIdRef.current}-${photoRevisionRef.current}`,
        captureId: captureIdRef.current,
        revision: photoRevisionRef.current,
        preview: true,
        dataUrl,
        frame: nextFrame,
        layout,
        eventName: eventNameRef.current,
      });
    } catch (error) {
      console.error("Failed to update photo frame:", error);
      setCallStatus(
        "Something went wrong updating the photo — check the console and try again.",
      );
    }
  };

  const selectLayout = async (nextLayout) => {
    if (!canCustomizePreview || !photoDataUrl) return;
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setCallStatus("Couldn't update the photo — canvas not ready, try again.");
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering context is unavailable.");
      const dataUrl = await renderPhotoWithFonts({
        canvas,
        context,
        participants: sourceParticipantsRef.current,
        burstShots: sourceBurstParticipantsRef.current.length
          ? sourceBurstParticipantsRef.current
          : undefined,
        frame,
        layout: nextLayout,
        frameOptions: { eventName: eventNameRef.current },
      });
      setSelectedLayout(nextLayout);
      setPhotoDataUrl(dataUrl);
      photoRevisionRef.current += 1;
      broadcastPhoto({
        id: `${captureIdRef.current}-${photoRevisionRef.current}`,
        captureId: captureIdRef.current,
        revision: photoRevisionRef.current,
        preview: true,
        dataUrl,
        frame,
        layout: nextLayout,
        eventName: eventNameRef.current,
      });
    } catch (error) {
      console.error("Failed to update photo layout:", error);
      setCallStatus(
        "Something went wrong updating the photo layout — check the console and try again.",
      );
    }
  };

  const savePhoto = () => {
    if (!canCustomizePreview || photoSavedRef.current || !photoDataUrl) return;
    const photo = addPhoto(photoDataUrl, frame, layout);
    photoRevisionRef.current += 1;
      broadcastPhoto({
        id: `${captureIdRef.current}-${photoRevisionRef.current}`,
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
  };

  const hidePreview = () => {
    setShowPreview(false);
    setCanCustomizePreview(false);
    setPhotoPending(false);
    setSelectedLayout("single-horizontal");
    sourceParticipantsRef.current = [];
    sourceBurstParticipantsRef.current = [];
    photoSavedRef.current = false;
    captureIdRef.current = null;
  };

  return {
    frame,
    setFrame: selectFrame,
    layout,
    setLayout: selectLayout,
    eventName,
    setEventName: updateEventName,
    countdown,
    shotNumber,
    totalShots: PHOTO_SHOT_COUNT,
    showFlash,
    showPreview,
    canCustomizePreview,
    photoPending,
    photoDataUrl,
    takePhoto,
    savePhoto,
    receivePhoto,
    receiveCountdown,
    cancelCountdown,
    hidePreview,
  };
}
