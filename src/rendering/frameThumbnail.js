import { renderPhoto } from "./PhotoRenderer.js";
import { loadFrameFonts } from "./frameFonts.js";

const THUMB_WIDTH = 148;
const THUMB_HEIGHT = 84;

/** In-flight and rendered thumbnails, keyed by frame and layout. */
const thumbCache = new Map();

async function renderThumbnail(frameKey, layout) {
  // Canvas text uses whatever font is available at draw time, so wait for the
  // frame's web fonts or the cached thumbnail would keep a fallback face.
  await loadFrameFonts(frameKey);

  const canvas = document.createElement("canvas");
  canvas.width = THUMB_WIDTH;
  canvas.height = THUMB_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return "";
  return renderPhoto({
    canvas,
    context,
    participants: [],
    frame: frameKey,
    layout,
    frameOptions: { eventName: "" },
  });
}

/**
 * Renders a real frame thumbnail (no photos) by running the frame's own
 * renderer at a small size, so the picker shows exactly what the frame looks
 * like instead of a hand-drawn approximation.
 *
 * Awaiting the frame's fonts before drawing keeps a fallback face out of the
 * cache. Concurrent requests for the same frame and layout share one render.
 *
 * @param {string} frameKey - Frame id from `FRAMES`.
 * @param {string} [layout] - Layout id from `LAYOUTS`.
 * @returns {Promise<string>} Data URL, or an empty string if rendering failed.
 */
export function getFrameThumbnail(frameKey, layout = "single-horizontal") {
  const cacheKey = `${frameKey}:${layout}`;
  const cached = thumbCache.get(cacheKey);
  if (cached) return cached;

  const pending = renderThumbnail(frameKey, layout).catch((error) => {
    // Only drop this attempt; a cache clear may already have started a newer one.
    if (thumbCache.get(cacheKey) === pending) thumbCache.delete(cacheKey);
    console.warn(
      `Could not render a thumbnail for frame "${frameKey}":`,
      error,
    );
    return "";
  });
  thumbCache.set(cacheKey, pending);
  return pending;
}

export function clearFrameThumbnailCache() {
  thumbCache.clear();
}
