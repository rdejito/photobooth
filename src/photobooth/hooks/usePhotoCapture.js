import { useEffect, useRef, useState } from "react";
import { renderPhoto } from "../rendering/PhotoRenderer.js";

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
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [canCustomizePreview, setCanCustomizePreview] = useState(false);
  const [photoPending, setPhotoPending] = useState(false);
  const countdownRef = useRef(null);
  const flashRef = useRef(null);
  const sourceParticipantsRef = useRef([]);
  const photoSavedRef = useRef(false);
  const captureIdRef = useRef(null);
  const photoRevisionRef = useRef(0);
  const receivedPhotoRef = useRef(null);

  useEffect(
    () => () => {
      clearInterval(countdownRef.current);
      clearTimeout(flashRef.current);
    },
    [],
  );

  const takePhoto = () => {
    if (!canCapture) return;
    clearInterval(countdownRef.current);
    let seconds = 3;
    setCountdown(seconds);
    broadcastCountdown(seconds);
    countdownRef.current = setInterval(() => {
      seconds -= 1;
      if (seconds === 0) {
        setCountdown("📸");
        broadcastCountdown("📸");
      } else if (seconds < 0) {
        clearInterval(countdownRef.current);
        setCountdown(null);
        broadcastCountdown(null);
        capture();
      } else {
        setCountdown(seconds);
        broadcastCountdown(seconds);
      }
    }, 700);
  };

  const cancelCountdown = () => {
    clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
    broadcastCountdown(null);
  };

  const receiveCountdown = (value) => setCountdown(value);

  const capture = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setCallStatus("Couldn't take photo — canvas not ready, try again.");
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering context is unavailable.");

      const participants = getVideoElements();
      if (participants.length !== expectedParticipantCount) {
        setCallStatus("Wait until every camera preview is ready before taking the group photo.");
        return;
      }
      if (participants.length < 2) {
        setCallStatus("At least two cameras need to be ready to take a group photo.");
        return;
      }
      sourceParticipantsRef.current = participants.map(({ video, label }) => {
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
      const dataUrl = renderPhoto({
        canvas,
        context,
        participants: sourceParticipantsRef.current,
        frame,
      });
      captureIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      photoRevisionRef.current = 0;
      setPhotoDataUrl(dataUrl);
      photoSavedRef.current = false;
      setCanCustomizePreview(true);
      setPhotoPending(false);
      setShowPreview(true);
      broadcastPhoto({
        id: `${captureIdRef.current}-0`,
        captureId: captureIdRef.current,
        revision: 0,
        preview: true,
        dataUrl,
        frame,
      });
      setShowFlash(true);
      clearTimeout(flashRef.current);
      flashRef.current = setTimeout(() => setShowFlash(false), 400);
    } catch (error) {
      console.error("Failed to capture photo:", error);
      setCallStatus(
        "Something went wrong taking the photo — check the console and try again.",
      );
    }
  };

  const receivePhoto = (photo) => {
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
    if (!photo.preview) addPhoto(photo.dataUrl, photo.frame);
    receivedPhotoRef.current = {
      captureId,
      revision,
      saved: !photo.preview,
    };
    setPhotoDataUrl(photo.dataUrl);
    setSelectedFrame(photo.frame);
    setCanCustomizePreview(false);
    setPhotoPending(photo.preview === true);
    setShowPreview(true);
    setShowFlash(true);
    clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setShowFlash(false), 400);
  };

  const selectFrame = (nextFrame) => {
    if (!canCustomizePreview || !sourceParticipantsRef.current.length) return;
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setCallStatus("Couldn't update the photo — canvas not ready, try again.");
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering context is unavailable.");
      const dataUrl = renderPhoto({
        canvas,
        context,
        participants: sourceParticipantsRef.current,
        frame: nextFrame,
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
      });
    } catch (error) {
      console.error("Failed to update photo frame:", error);
      setCallStatus(
        "Something went wrong updating the photo — check the console and try again.",
      );
    }
  };

  const savePhoto = () => {
    if (!canCustomizePreview || photoSavedRef.current || !photoDataUrl) return;
    const photo = addPhoto(photoDataUrl, frame);
    photoRevisionRef.current += 1;
    broadcastPhoto({
      id: `${captureIdRef.current}-${photoRevisionRef.current}`,
      captureId: captureIdRef.current,
      revision: photoRevisionRef.current,
      preview: false,
      dataUrl: photoDataUrl,
      frame,
    });
    photoSavedRef.current = true;
    sourceParticipantsRef.current = [];
    setCanCustomizePreview(false);
  };

  const hidePreview = () => {
    setShowPreview(false);
    setCanCustomizePreview(false);
    setPhotoPending(false);
    sourceParticipantsRef.current = [];
    photoSavedRef.current = false;
    captureIdRef.current = null;
  };

  return {
    frame,
    setFrame: selectFrame,
    countdown,
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
