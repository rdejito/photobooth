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
  const [frame, setFrame] = useState("classic");
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const countdownRef = useRef(null);
  const flashRef = useRef(null);

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
      const dataUrl = renderPhoto({
        canvas,
        context,
        participants,
        frame,
      });
      addPhoto(dataUrl, frame);
      setPhotoDataUrl(dataUrl);
      setShowPreview(true);
      broadcastPhoto({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
    addPhoto(photo.dataUrl, photo.frame);
    setPhotoDataUrl(photo.dataUrl);
    setShowPreview(true);
    setShowFlash(true);
    clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setShowFlash(false), 400);
  };

  return {
    frame,
    setFrame,
    countdown,
    showFlash,
    showPreview,
    photoDataUrl,
    takePhoto,
    receivePhoto,
    receiveCountdown,
    cancelCountdown,
    hidePreview: () => setShowPreview(false),
  };
}
