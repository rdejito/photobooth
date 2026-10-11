/**
 * Rendering helpers for composed photos.
 *
 * Composing pulls double duty: awaiting the frame's web fonts (so canvas text
 * never silently falls back) and drawing through the app's one render entry
 * point. Kept separate from the capture hook so the sequence and the message
 * publisher stay focused on timing and messaging.
 */
import { renderPhoto } from "../../rendering/PhotoRenderer.js";
import { loadFrameFonts } from "../../rendering/frameFonts.js";

/**
 * Renders a photo with the given options, first awaiting the fonts the chosen
 * frame uses so Canvas text never falls back to the wrong typeface.
 */
export async function renderPhotoWithFonts(options) {
  await loadFrameFonts(options.frame);
  return renderPhoto(options);
}

/**
 * Composes a photo onto `canvasRef`'s canvas, returning either the composed
 * `dataUrl` or a machine-readable `error` ("missing-canvas", "missing-context",
 * or the renderer's own error). Callers turn those into their own messages.
 *
 * @returns {Promise<{ dataUrl: string } | { error: unknown }>}
 */
export async function composePhoto(canvasRef, options) {
  const canvas = canvasRef?.current;
  if (!canvas) return { error: "missing-canvas" };
  const context = canvas.getContext("2d");
  if (!context) return { error: "missing-context" };
  try {
    const dataUrl = await renderPhotoWithFonts({ canvas, context, ...options });
    return { dataUrl };
  } catch (error) {
    return { error };
  }
}