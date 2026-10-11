import { FRAMES, LAYOUTS } from "./constants.js";

export function roomToPeerId(room) {
  return `photobooth-${room.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export function getFrameLabel(frameKey) {
  return FRAMES.find(({ key }) => key === frameKey)?.label || frameKey;
}

export function getLayoutLabel(layoutKey) {
  return LAYOUTS.find(({ key }) => key === layoutKey)?.label || layoutKey;
}

export function createGalleryEntry(dataUrl, frame, layout = "single-horizontal") {
  return {
    id: Date.now() + Math.random(),
    dataUrl,
    frame,
    layout,
    takenAt: new Date().toLocaleString(),
  };
}
