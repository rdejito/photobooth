import { renderPhoto } from "./PhotoRenderer.js";

const THUMB_WIDTH = 148;
const THUMB_HEIGHT = 84;

const thumbCache = new Map();

/**
 * Renders a real frame thumbnail (no photos) by running the frame's own
 * renderer at a small size, so the picker shows exactly what the frame looks
 * like instead of a hand-drawn approximation.
 */
export function getFrameThumbnail(frameKey, layout = "single-horizontal") {
  const cacheKey = `${frameKey}:${layout}`;
  if (thumbCache.has(cacheKey)) return thumbCache.get(cacheKey);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = THUMB_WIDTH;
    canvas.height = THUMB_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) return "";
    const dataUrl = renderPhoto({
      canvas,
      context,
      participants: [],
      frame: frameKey,
      layout,
      frameOptions: { eventName: "" },
    });
    thumbCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (error) {
    console.warn(
      `Could not render a thumbnail for frame "${frameKey}":`,
      error,
    );
    return "";
  }
}

export function clearFrameThumbnailCache() {
  thumbCache.clear();
}
