import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
  roundedRectPath,
} from "./units.js";
import {
  drawOutlinedPill,
  drawSparkle,
  fontStack,
  getCachedBackground,
  normalizeParticipants,
  resolveFrameLabels,
} from "./shared.js";

/**
 * One parameterized renderer for the Pop family: pop, blush, noir, mint.
 * The template is authored in design units and scaled to the real canvas, so
 * it composes at any output resolution. Only the palette (and the background
 * pattern kind) changes between themes.
 */
export const POP_PALETTES = {
  pop: {
    frame: "#2B3FE0",
    accent: "#FFE24A",
    accentText: "#141414",
    pop: "#FF5CA8",
    text: "#FFFFFF",
    shadow: "#141414",
    slotBorder: "#FFFFFF",
    pattern: "dots",
    dotColor: "rgba(255,255,255,0.9)",
    gridColor: null,
  },
  blush: {
    frame: "#F9D5DF",
    accent: "#B0245A",
    accentText: "#FDF0F4",
    pop: "#FFE08A",
    text: "#5A1A33",
    shadow: "#5A1A33",
    slotBorder: "#FFFFFF",
    pattern: "dots",
    dotColor: "rgba(255,255,255,0.95)",
    gridColor: null,
  },
  noir: {
    frame: "#121212",
    accent: "#FFFFFF",
    accentText: "#121212",
    pop: "#FF3B3B",
    text: "#FFFFFF",
    shadow: "#FF3B3B",
    slotBorder: "#FFFFFF",
    pattern: "grid",
    dotColor: null,
    gridColor: "rgba(255,255,255,0.16)",
  },
  mint: {
    frame: "#BFE9D8",
    accent: "#0F5C45",
    accentText: "#F2FBF6",
    pop: "#FFD166",
    text: "#0B2E24",
    shadow: "#0B2E24",
    slotBorder: "#FFFFFF",
    pattern: "dots",
    dotColor: "rgba(11,46,36,0.22)",
    gridColor: null,
  },
};

function drawPattern(context, width, height, palette) {
  if (palette.pattern === "grid") {
    context.save();
    context.strokeStyle = palette.gridColor;
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 44) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y <= height; y += 44) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();
    return;
  }

  context.save();
  context.fillStyle = palette.dotColor;
  const step = 26;
  const radius = 3;
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

/** Film-hole dashes along the two long edges of the frame. */
function drawFilmHoles(context, width, height, palette) {
  const vertical = height > width;
  const holeCount = vertical ? Math.floor(height / 34) : Math.floor(width / 34);
  const spacing = (vertical ? height : width) / holeCount;
  context.save();
  context.fillStyle = palette.pop;
  for (let index = 0; index < holeCount; index += 1) {
    const along = spacing * (index + 0.5);
    const hole = vertical
      ? { x: 12, y: along, w: 10, h: 16 }
      : { x: along, y: 12, w: 16, h: 10 };
    context.beginPath();
    roundedRectPath(context, hole.x, hole.y, hole.w, hole.h, 4);
    context.fill();
    const far = vertical
      ? { x: width - 22, y: along, w: 10, h: 16 }
      : { x: along, y: height - 22, w: 16, h: 10 };
    context.beginPath();
    roundedRectPath(context, far.x, far.y, far.w, far.h, 4);
    context.fill();
  }
  context.restore();
}

/** "SMILE!" starburst drawn as an alternating-radius polygon. */
function drawStarburst(context, x, y, outer, inner, points, fill, textColor) {
  context.save();
  context.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const angle = (Math.PI * index) / points - Math.PI / 2;
    const radius = index % 2 === 0 ? outer : inner;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fillStyle = fill;
  context.fill();
  context.fillStyle = textColor;
  context.font = `700 ${Math.round(outer * 0.62)}px ${fontStack("archivoBlack")}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("SMILE!", x, y + 1);
  context.restore();
}

function drawTitle(context, anchors, palette, ink) {
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

function drawAssignments(context, anchors, labels, palette, ink, layout, bounds) {
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

/** Signature emblem: a small camera badge with a sparkle burst. */
function drawEmblem(context, x, y, palette, ink) {
  context.save();
  context.beginPath();
  roundedRectPath(context, x - 26, y - 20, 52, 40, 10);
  context.fillStyle = palette.accent;
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = ink;
  context.stroke();
  context.beginPath();
  context.arc(x, y, 11, 0, Math.PI * 2);
  context.fillStyle = palette.frame;
  context.fill();
  context.beginPath();
  context.arc(x, y, 5, 0, Math.PI * 2);
  context.fillStyle = palette.pop;
  context.fill();
  drawSparkle(context, x - 30, y - 26, 7, palette.pop);
  drawSparkle(context, x + 32, y + 24, 6, ink);
  context.restore();
}

export function renderPopTheme(themeKey, canvas, context, participants, options = {}) {
  const palette = POP_PALETTES[themeKey] || POP_PALETTES.pop;
  const layout = DESIGN_UNITS[options.layout] ? options.layout : "single-horizontal";
  const { width, height } = getDesignUnits(layout);
  const labels = resolveFrameLabels(options);
  const slots = getSlotRects(layout);
  const anchors = getTemplateAnchors(layout);
  const frames = options.groupShots?.length
    ? options.groupShots
    : normalizeParticipants(participants);

  canvas.width = width;
  canvas.height = height;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);

  // 1. Background + pattern (cached offscreen, per size).
  const background = getCachedBackground({
    key: `pop:${themeKey}`,
    width,
    height,
    draw: (bgContext, w, h) => {
      bgContext.fillStyle = palette.frame;
      bgContext.fillRect(0, 0, w, h);
      drawPattern(bgContext, w, h, palette);
    },
  });
  context.drawImage(background, 0, 0);

  drawFilmHoles(context, width, height, palette);

  // Decorative margin accents; drawn before photos so they can never overlap.
  const ink = palette.accent === palette.text ? palette.pop : palette.accent;
  anchors.accents.forEach(([x, y], index) => {
    drawSparkle(context, x, y, index % 2 === 0 ? 7 : 4, index % 3 === 0 ? ink : palette.pop);
  });
  if (anchors.smile) {
    // Keep the starburst lettering readable against its own fill.
    const smileInk = palette.frame === "#121212" || palette.frame === "#2B3FE0"
      ? palette.frame
      : palette.shadow;
    drawStarburst(
      context,
      anchors.smile.x,
      anchors.smile.y,
      34,
      16,
      12,
      palette.pop,
      smileInk,
    );
  }
  drawEmblem(context, anchors.emblem.x, anchors.emblem.y, palette, ink);

  // 2. Photos, clipped into their slots, with the alternating tilt.
  slots.forEach((slot, index) => {
    const tilt = (index % 2 === 0 ? -1.5 : 1.5) * (Math.PI / 180);
    const shadowOffset = 5;
    context.save();
    const centerX = slot.x + slot.width / 2;
    const centerY = slot.y + slot.height / 2;
    context.translate(centerX, centerY);
    context.rotate(tilt);
    context.translate(-centerX, -centerY);
    context.fillStyle = palette.shadow;
    context.fillRect(slot.x + shadowOffset, slot.y + shadowOffset, slot.width, slot.height);
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: palette.slotBorder,
      borderWidth: 4,
      placeholderFill: "#d9dbe0",
      placeholderInk: "#8b919c",
      labelColor: "#6d7380",
      labelFont: `700 20px ${fontStack("dmMono")}`,
    });
    context.restore();
  });

  // 3. Foreground copy that sits in the frame margins.
  drawTitle(context, anchors, palette, ink);
  drawAssignments(context, anchors, labels, palette, ink, layout, { width, height });
}

export function renderPop(canvas, context, participants, options) {
  return renderPopTheme("pop", canvas, context, participants, options);
}

export function renderBlush(canvas, context, participants, options) {
  return renderPopTheme("blush", canvas, context, participants, options);
}

export function renderNoir(canvas, context, participants, options) {
  return renderPopTheme("noir", canvas, context, participants, options);
}

export function renderMint(canvas, context, participants, options) {
  return renderPopTheme("mint", canvas, context, participants, options);
}
