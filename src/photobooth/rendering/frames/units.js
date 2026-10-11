/**
 * Design-unit infrastructure shared by the themed frame renderers.
 *
 * Every themed frame is authored in fixed "design units" per layout and then
 * scaled to the real canvas with a single context scale, so the same template
 * works at any output resolution while keeping the burst-shot pipeline intact.
 */

export const DESIGN_UNITS = {
  "single-horizontal": { width: 1280, height: 360 },
  "single-vertical": { width: 340, height: 1090 },
  "grid-2x2": { width: 720, height: 696 },
};

export const DESIGN_LAYOUT_KEYS = Object.keys(DESIGN_UNITS);

export function getDesignUnits(layout) {
  return DESIGN_UNITS[layout] || DESIGN_UNITS["single-horizontal"];
}

/**
 * Slot geometry in design units for a layout. Four 4:3 slots, arranged
 * horizontally, vertically or 2x2. Each theme decides how it decorates around
 * these rectangles; the geometry itself is shared.
 */
const SLOT_BOXES = {
  // Horizontal is wide and short: slots sit between a top title band and a
  // bottom label band, so both stay inside the canvas.
  "single-horizontal": { x: 30, y: 78, w: 286, h: 200, gap: 24 },
  "single-vertical": { x: 30, y: 158, w: 280, h: 195, gap: 30 },
  "grid-2x2": { x: 44, y: 104, w: 307, h: 230, gap: 34 },
};

export function getSlotRects(layout) {
  const box = SLOT_BOXES[layout] || SLOT_BOXES["single-horizontal"];
  if (layout === "single-vertical") {
    return [0, 1, 2, 3].map((index) => ({
      x: box.x,
      y: box.y + index * (box.h + box.gap),
      width: box.w,
      height: box.h,
    }));
  }
  if (layout === "grid-2x2") {
    return [0, 1, 2, 3].map((index) => ({
      x: box.x + (index % 2) * (box.w + box.gap),
      y: box.y + Math.floor(index / 2) * (box.h + box.gap),
      width: box.w,
      height: box.h,
    }));
  }
  return [0, 1, 2, 3].map((index) => ({
    x: box.x + index * (box.w + box.gap),
    y: box.y,
    width: box.w,
    height: box.h,
  }));
}

/**
 * Per-layout copy positions in design units for the shared template pieces:
 * title (one or two lines), date, event label, emblem and accents.
 */
export function getTemplateAnchors(layout) {
  if (layout === "single-vertical") {
    return {
      titleLines: ["Little", "Moments"],
      title: { x: 170, y: 78, size: 34, lineHeight: 36 },
      date: { x: 170, y: 1032 },
      event: { x: 170, y: 1064 },
      emblem: { x: 296, y: 128 },
      smile: { x: 52, y: 128 },
      accents: [
        [24, 42],
        [316, 42],
        [170, 40],
        [24, 1044],
        [316, 1044],
      ],
    };
  }
  if (layout === "grid-2x2") {
    return {
      titleLines: ["Little Moments"],
      title: { x: 360, y: 56, size: 42, lineHeight: 44 },
      date: { x: 360, y: 656 },
      event: { x: 360, y: 682 },
      emblem: { x: 660, y: 54 },
      smile: { x: 68, y: 660 },
      accents: [
        [22, 50],
        [698, 50],
        [22, 648],
        [698, 650],
        [30, 340],
        [690, 360],
        [360, 86],
      ],
    };
  }
    return {
      titleLines: ["Little Moments"],
      title: { x: 640, y: 50, size: 40, lineHeight: 42 },
      date: { x: 1150, y: 330 },
      event: { x: 560, y: 330 },
      emblem: { x: 1206, y: 44 },
      smile: { x: 96, y: 322 },
      accents: [
        [22, 40],
        [1258, 40],
        [22, 320],
        [1258, 322],
        [640, 26],
        [1000, 330],
        [300, 330],
      ],
    };
  }

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

/**
 * Cover-crops an image source into `target`, optionally flipping it. The flip
 * lives here (rather than in the callers) so the mirrored camera preview and a
 * pre-composed group shot share the exact same crop maths.
 */
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

function slotInnerBox(slot, borderWidth) {
  return {
    x: slot.x + borderWidth,
    y: slot.y + borderWidth,
    width: Math.max(0, slot.width - borderWidth * 2),
    height: Math.max(0, slot.height - borderWidth * 2),
  };
}

/**
 * Draws one participant into a slot. Mirrors the cover-crop behaviour of the
 * live preview (including the horizontal flip that makes the mirrored camera
 * preview line up) and draws a gray placeholder with a mountain glyph and
 * "PHOTO n" label when no photo is available.
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
 * pipeline (for example a group shot containing every participant), or a single
 * participant. Falls back to a placeholder when neither is available.
 */
export function drawSlotPhoto(context, slot, content, options = {}) {
  if (content && typeof content.getContext === "function") {
    drawSlotCanvas(context, slot, content, options);
    return;
  }
  drawSlotParticipant(context, slot, content, options);
}

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

export function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
