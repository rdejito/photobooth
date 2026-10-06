import { FRAMES } from "./constants.js";

export function roomToPeerId(room) {
  return `photobooth-${room.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export function getFrameLabel(frameKey) {
  return FRAMES.find(({ key }) => key === frameKey)?.label || frameKey;
}

export function createGalleryEntry(dataUrl, frame) {
  return {
    id: Date.now() + Math.random(),
    dataUrl,
    frame,
    takenAt: new Date().toLocaleString(),
  };
}
