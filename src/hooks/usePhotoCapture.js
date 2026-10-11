import { useEffect, useRef, useState } from "react";
import { PhotoCaptureSequence } from "./capture/captureSequence.js";
import {
  completeCapture,
  recomposePhoto,
  saveCapturedPhoto,
} from "./capture/hostComposer.js";
import {
  applyIncomingCountdown,
  applyIncomingPhoto,
} from "./capture/peerInbox.js";
import { PHOTO_SHOT_COUNT } from "../lib/constants.js";

const FLASH_DURATION_MS = 400;

/**
 * usePhotoCapture — the capture session's React shell.
 *
 * Owns the UI state of a photo session (frame, layout, event name, countdown,
 * flash, preview dialog) and wires the room's channels. The four-shot
 * countdown/snapshot timing lives in PhotoCaptureSequence, host composition in
 * hostComposer, the guest receive path in peerInbox — this hook is the glue.
 *
 * @param {object} options
 * @param {() => Array<{ video: HTMLVideoElement, label: string }>} options.getVideoElements
 * @param {React.RefObject} options.canvasRef - Composition canvas (hidden).
 * @param {(dataUrl: string, frame: string, layout: string) => object} options.addPhoto
 * @param {(status: string) => void} options.setCallStatus
 * @param {boolean} options.canCapture - Whether a capture may start.
 * @param {number} options.expectedParticipantCount - Cameras to snapshot.
 * @param {(message: object) => void} options.broadcastPhoto
 * @param {(value: number|string|null, meta?: object) => void} options.broadcastCountdown
 */
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
  const [countdown, setCountdown] = useState(null);
  const [shotNumber, setShotNumber] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [canCustomizePreview, setCanCustomizePreview] = useState(false);
  const [photoPending, setPhotoPending] = useState(false);
  const flashRef = useRef(null);
  const eventNameRef = useRef("");
  const sourceParticipantsRef = useRef([]);
  const sourceBurstParticipantsRef = useRef([]);
  const photoSavedRef = useRef(false);
  const captureIdRef = useRef(null);
  const photoRevisionRef = useRef(0);
  const receivedPhotoRef = useRef(null);

  // The burst controller is created once and re-bound each render so its
  // callbacks always see the latest room state.
  const sequenceRef = useRef(null);
  if (sequenceRef.current === null) {
    sequenceRef.current = new PhotoCaptureSequence({
      onCountdown: () => {},
      onFlash: () => {},
      onPaused: () => {},
      onFinished: () => {},
      onAbort: () => {},
    });
  }

  // Leaving, canceling or unmounting must unwind the whole burst cleanly.
  useEffect(
    () => () => {
      clearTimeout(flashRef.current);
      sequenceRef.current.clearTimers();
    },
    [],
  );

  const updateEventName = (value) => {
    eventNameRef.current = value;
    setEventName(value);
  };

  const triggerFlash = () => {
    setShowFlash(true);
    clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setShowFlash(false), FLASH_DURATION_MS);
  };

  // A capture failed mid-burst: wipe every trace of it from the UI.
  const abortCapture = (message) => {
    if (message) setCallStatus(message);
    clearTimeout(flashRef.current);
    setPhotoPending(false);
    setShowFlash(false);
    setCountdown(null);
    setShotNumber(0);
    broadcastCountdown(null);
  };

  // The mutable bundle hostComposer/peerInbox operate on. Rebuilt each render
  // so helpers always read fresh state.
  const session = {
    sequence: sequenceRef.current,
    canvasRef,
    broadcastPhoto,
    setCallStatus,
    frame,
    layout,
    eventNameRef,
    canCustomizePreview,
    photoDataUrl,
    addPhoto,
    abortCapture,
    setCountdown,
    setShotNumber,
    broadcastCountdown,
    setPhotoPending,
    setPhotoDataUrl,
    setCanCustomizePreview,
    setShowPreview,
    setSelectedFrame,
    setSelectedLayout,
    sourceParticipantsRef,
    sourceBurstParticipantsRef,
    captureIdRef,
    photoRevisionRef,
    photoSavedRef,
    receivedPhotoRef,
    triggerFlash,
    updateEventName,
  };

  sequenceRef.current.bind({
    getVideoElements,
    expectedParticipantCount,
    onCountdown: (value, shot) => {
      setCountdown(value);
      setShotNumber(Number.isInteger(shot) && shot > 0 ? shot : 0);
      broadcastCountdown(value, { shot: Math.max(shot, 1), total: PHOTO_SHOT_COUNT });
    },
    onFlash: triggerFlash,
    onPaused: () => {
      setCountdown(null);
      setShotNumber(0);
      broadcastCountdown(null);
    },
    onFinished: (shots) => {
      void completeCapture(session, shots);
    },
    onAbort: abortCapture,
  });

  const takePhoto = () => {
    if (!canCapture || sequenceRef.current.inProgress) return;
    sourceBurstParticipantsRef.current = [];
    setPhotoPending(true);
    sequenceRef.current.start();
  };

  const cancelCountdown = () => {
    sequenceRef.current.clearTimers();
    clearTimeout(flashRef.current);
    sequenceRef.current.inProgress = false;
    setShowFlash(false);
    setCountdown(null);
    setShotNumber(0);
    broadcastCountdown(null);
  };

  // Guests render the host's latest revision; the newest saved photo wins.
  const receivePhoto = (photo) => applyIncomingPhoto(photo, session);

  const receiveCountdown = (value, meta) =>
    applyIncomingCountdown(value, meta, session);

  const selectFrame = (nextFrame) =>
    recomposePhoto(session, {
      nextFrame,
      logLabel: "Failed to update photo frame:",
      failStatus:
        "Something went wrong updating the photo — check the console and try again.",
    });

  const selectLayout = (nextLayout) =>
    recomposePhoto(session, {
      nextLayout,
      logLabel: "Failed to update photo layout:",
      failStatus:
        "Something went wrong updating the photo layout — check the console and try again.",
    });

  const savePhoto = () => saveCapturedPhoto(session);

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