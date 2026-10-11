/**
 * Foreground copy painters for the Pop family: the offset-shadow title and the
 * date / event pills that sit in the frame margins.
 */
import { drawOutlinedPill, fontStack } from "../shared.js";

/** Draws the title with a hard offset shadow (no blur). */
export function drawTitle(context, anchors, palette, ink) {
  context.save();
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.font = `700 ${anchors.title.size}px ${fontStack("archivoBlack")}`;
  anchors.titleLines.forEach((line, index) => {
    const y = anchors.title.y + index * anchors.title.lineHeight;
    context.fillStyle = palette.shadow;
    context.fillText(line, anchors.title.x + 5, y + 5);
    context.fillStyle = ink;
    context.fillText(line, anchors.title.x, y);
  });
  context.restore();
}

/** Draws the date pill and, when present, the event pill. */
export function drawAssignments(context, anchors, labels, palette, ink, layout, bounds) {
  const labelFont = `400 ${layout === "single-vertical" ? 16 : 18}px ${fontStack("dmMono")}`;
  const clampX = (x, text) => {
    const half = context.measureText(text).width / 2;
    // Keep the pill fully inside the frame, clear of the film-hole dashes.
    return Math.min(Math.max(x, half + 28), bounds.width - half - 28);
  };
  const dateText = `DATE ${labels.date}`;
  context.font = labelFont;
  drawOutlinedPill(context, dateText, {
    x: clampX(anchors.date.x, dateText),
    y: anchors.date.y,
    font: labelFont,
    textColor: palette.accentText || palette.shadow,
    borderColor: ink,
    fillColor: palette.accent,
  });
  if (labels.hasEvent) {
    drawOutlinedPill(context, labels.event, {
      x: clampX(anchors.event.x, labels.event),
      y: anchors.event.y,
      font: labelFont,
      textColor: ink,
      borderColor: ink,
      fillColor: palette.frame,
    });
  }
}
