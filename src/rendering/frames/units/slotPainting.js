/**
 * Slot painting: draws photos, pre-composed cells and placeholders into a
 * frame's photo slot. All cropping/flipping lives here so the mirrored live
 * preview, a direct participant snapshot and a pre-composed group shot all
 * share the exact same cover-crop maths.
 */
import { roundedRectPath } from "./primitives.js";

/** Fills a slot rectangle with its border colour, respecting rounding. */
function paintSlotBorder(context, slot, { borderColor, borderWidth, borderRadius }) {
  if (!(borderWidth > 0)) return;
  const { x, y, width, height } = slot;
  context.save();
  if (borderRadius > 0) {
    context.beginPath();
    roundedRectPath(context, x, y, width, height, borderRadius);
    context.fillStyle = borderColor;
    context.fill();
  } else {
    context.fillStyle = borderColor;
    context.fillRect(x, y, width, height);
  }
  context.restore();
}

/** Cover-crops an image source into `target`, optionally mirroring it horizontally. */
function paintCoverImage(context, image, source, target, { borderRadius, borderWidth, mirrored }) {
  const { x, y, width, height } = target;
  context.save();
  if (mirrored) {
    context.translate(x + width, y);
    context.scale(-1, 1);
    if (borderRadius > 0) {
      roundedRectPath(context, 0, 0, width, height, Math.max(0, borderRadius - borderWidth));
      context.clip();
    }
    context.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, width, height);
  } else {
    if (borderRadius > 0) {
      roundedRectPath(context, x, y, width, height, Math.max(0, borderRadius - borderWidth));
      context.clip();
    }
    context.drawImage(image, source.x, source.y, source.width, source.height, x, y, width, height);
  }
  context.restore();
}

/** Computes the source rectangle that cover-fits an image into a target box. */
function coverSource(width, height, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / width, targetHeight / height);
  const sourceWidth = targetWidth / scale;
  const sourceHeight = targetHeight / scale;
  return {
    x: (width - sourceWidth) / 2,
    y: (height - sourceHeight) / 2,
    width: sourceWidth,
    height: sourceHeight,
  };
}

/** Shrinks a slot by its border width so the photo never covers the border. */
function slotInnerBox(slot, borderWidth) {
  return {
    x: slot.x + borderWidth,
    y: slot.y + borderWidth,
    width: Math.max(0, slot.width - borderWidth * 2),
    height: Math.max(0, slot.height - borderWidth * 2),
  };
}

/**
 * Draws one participant into a slot, mirroring the live preview (including the
 * horizontal flip) or a gray placeholder with a mountain glyph and "PHOTO n"
 * label when no photo is available.
 */
function drawSlotParticipant(
  context,
  slot,
  participant,
  {
    label,
    borderColor = "#ffffff",
    borderWidth = 5,
    placeholderFill = "#d7d9de",
    placeholderInk = "#8a909b",
    labelColor = "#6c7280",
    labelFont = "700 20px 'DM Mono', monospace",
    borderRadius = 0,
  } = {},
) {
  const inner = slotInnerBox(slot, borderWidth);

  paintSlotBorder(context, slot, { borderColor, borderWidth, borderRadius });

  const video = participant?.video;
  if (!video) {
    drawSlotPlaceholder(context, {
      x: inner.x,
      y: inner.y,
      width: inner.width,
      height: inner.height,
      fill: placeholderFill,
      ink: placeholderInk,
      labelColor,
      labelFont,
      label,
    });
    return;
  }

  const videoWidth = video.videoWidth || video.naturalWidth || video.width || inner.width;
  const videoHeight = video.videoHeight || video.naturalHeight || video.height || inner.height;

  paintCoverImage(
    context,
    video,
    coverSource(videoWidth, videoHeight, inner.width, inner.height),
    inner,
    { borderRadius, borderWidth, mirrored: true },
  );
}

/**
 * Draws a pre-composed cell (for example a group shot holding every
 * participant) into a slot. The canvas already contains mirrored tiles, so it
 * is cover-cropped as-is rather than flipped a second time.
 */
export function drawSlotCanvas(
  context,
  slot,
  canvas,
  { borderColor = "#ffffff", borderWidth = 5, borderRadius = 0 } = {},
) {
  const inner = slotInnerBox(slot, borderWidth);

  paintSlotBorder(context, slot, { borderColor, borderWidth, borderRadius });

  const canvasWidth = canvas.width || inner.width;
  const canvasHeight = canvas.height || inner.height;

  paintCoverImage(
    context,
    canvas,
    coverSource(canvasWidth, canvasHeight, inner.width, inner.height),
    inner,
    { borderRadius, borderWidth, mirrored: false },
  );
}

/**
 * Draws whatever a slot holds: a pre-composed cell canvas from the burst
 * pipeline, or a single participant. Falls back to a placeholder when neither
 * is available.
 */
export function drawSlotPhoto(context, slot, content, options = {}) {
  if (content && typeof content.getContext === "function") {
    drawSlotCanvas(context, slot, content, options);
    return;
  }
  drawSlotParticipant(context, slot, content, options);
}

/** Draws the no-photo placeholder: mountain glyph, dot and "PHOTO n" label. */
export function drawSlotPlaceholder(
  context,
  { x, y, width, height, fill, ink, labelColor, labelFont, label },
) {
  context.save();
  context.fillStyle = fill;
  context.fillRect(x, y, width, height);

  const centerX = x + width / 2;
  const centerY = y + height / 2 - height * 0.06;
  const glyph = Math.min(width, height) * 0.24;

  context.strokeStyle = ink;
  context.lineWidth = Math.max(1.5, glyph * 0.09);
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(centerX - glyph, centerY + glyph * 0.62);
  context.lineTo(centerX - glyph * 0.28, centerY - glyph * 0.2);
  context.lineTo(centerX + glyph * 0.1, centerY + glyph * 0.28);
  context.lineTo(centerX + glyph * 0.44, centerY - glyph * 0.42);
  context.lineTo(centerX + glyph, centerY + glyph * 0.62);
  context.closePath();
  context.stroke();
  context.beginPath();
  context.arc(centerX + glyph * 0.36, centerY - glyph * 0.62, glyph * 0.16, 0, Math.PI * 2);
  context.fillStyle = ink;
  context.fill();

  if (label) {
    context.font = labelFont;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = labelColor;
    context.fillText(label, centerX, y + height - Math.max(14, height * 0.12));
  }
  context.restore();
}
