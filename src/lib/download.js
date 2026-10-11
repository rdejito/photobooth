/**
 * Browser download helper.
 *
 * Both the photo preview dialog and the gallery trigger a download of a canvas
 * data URL; this is the single place that knows the trick (a temporary anchor
 * element with a `download` attribute, clicked programmatically). Keeping it
 * here means the filename policy and mechanism can't drift between callers.
 */

/** Triggers a download of an image `dataUrl` under the given `filename`. */
export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/** A `little-moments-<suffix>.png` name for a saved or captured image. */
export function littleMomentsFilename(suffix) {
  return `little-moments-${suffix}.png`;
}