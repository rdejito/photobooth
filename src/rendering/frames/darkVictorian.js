import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
  roundedRectPath,
} from "./units.js";
import {
  fontStack,
  getCachedBackground,
  normalizeParticipants,
  resolveFrameLabels,
  seededNoise,
} from "./shared.js";

const INK = "#14101C";
const GOLD = "#B79B5B";
const BLOOD = "#7B1220";
const TEXT = "#D8CCB2";

function drawLattice(context, width, height) {
  context.save();
  context.strokeStyle = "rgba(183,155,91,0.1)";
  context.lineWidth = 1;
  const step = 26;
  for (let x = -height; x < width; x += step) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + height, height);
    context.stroke();
    context.beginPath();
    context.moveTo(x + height, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  context.restore();
}

function drawVignette(context, width, height) {
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.72)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawDoubleGoldBorder(context, width, height) {
  context.save();
  context.strokeStyle = GOLD;
  context.lineWidth = 3;
  roundedRectPath(context, 14, 14, width - 28, height - 28, 8);
  context.stroke();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(183,155,91,0.6)";
  roundedRectPath(context, 26, 26, width - 52, height - 52, 6);
  context.stroke();

  const corners = [
    [14, 14], [width - 14, 14], [14, height - 14], [width - 14, height - 14],
  ];
  corners.forEach(([x, y]) => {
    context.save();
    context.translate(x, y);
    context.fillStyle = GOLD;
    context.beginPath();
    context.moveTo(0, -9);
    context.lineTo(9, 0);
    context.lineTo(0, 9);
    context.lineTo(-9, 0);
    context.closePath();
    context.fill();
    context.restore();
  });
  context.restore();
}

function drawBat(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(183,155,91,0.85)";
  context.beginPath();
  context.moveTo(0, 0);
  context.quadraticCurveTo(-8, -8, -18, -3);
  context.quadraticCurveTo(-12, 2, -14, 8);
  context.quadraticCurveTo(-6, 4, 0, 8);
  context.quadraticCurveTo(6, 4, 14, 8);
  context.quadraticCurveTo(12, 2, 18, -3);
  context.quadraticCurveTo(8, -8, 0, 0);
  context.closePath();
  context.fill();
  context.restore();
}

/** Wax-seal emblem with a crescent moon. */
function drawWaxSeal(context, x, y) {
  context.save();
  context.translate(x, y);
  context.fillStyle = "#6E0F1C";
  context.beginPath();
  const points = 22;
  for (let index = 0; index < points; index += 1) {
    const angle = (index / points) * Math.PI * 2;
    const radius = 26 + seededNoise(index) * 4;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fill();
  context.strokeStyle = "rgba(183,155,91,0.8)";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = GOLD;
  context.beginPath();
  context.arc(-2, 0, 12, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#6E0F1C";
  context.beginPath();
  context.arc(4, -3, 11, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export function renderDarkVictorian(canvas, context, participants, options = {}) {
  const layout = DESIGN_UNITS[options.layout] ? options.layout : "single-horizontal";
  const { width: designWidth, height: designHeight } = getDesignUnits(layout);
  const labels = resolveFrameLabels(options);
  const slots = getSlotRects(layout);
  const anchors = getTemplateAnchors(layout);
  const frames = options.groupShots?.length
    ? options.groupShots
    : normalizeParticipants(participants);

  canvas.width = designWidth;
  canvas.height = designHeight;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, designWidth, designHeight);

  const background = getCachedBackground({
    key: "victorian:bg",
    width: designWidth,
    height: designHeight,
    draw: (bgContext, w, h) => {
      bgContext.fillStyle = INK;
      bgContext.fillRect(0, 0, w, h);
      drawLattice(bgContext, w, h);
      drawVignette(bgContext, w, h);
    },
  });
  context.drawImage(background, 0, 0);

  drawDoubleGoldBorder(context, designWidth, designHeight);

  // Blood-red mats with thin gold lines, drawn before the photos.
  slots.forEach((slot) => {
    context.save();
    context.fillStyle = BLOOD;
    context.fillRect(slot.x - 12, slot.y - 12, slot.width + 24, slot.height + 24);
    context.strokeStyle = GOLD;
    context.lineWidth = 1.5;
    context.strokeRect(slot.x - 6, slot.y - 6, slot.width + 12, slot.height + 12);
    context.restore();
  });

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#3B2A31",
      borderWidth: 3,
      placeholderFill: "#2A2130",
      placeholderInk: "#8C7F6A",
      labelColor: TEXT,
      labelFont: `italic 20px ${fontStack("imFellItalic")}`,
    });
  });

  // Small gold bats, kept clear of the border and the photo mats.
  drawBat(context, 58, designHeight - 46, 0.8);
  drawBat(context, designWidth - 58, designHeight - 46, 0.7);
  drawWaxSeal(context, anchors.emblem.x, anchors.emblem.y);

  context.save();
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.font = `700 ${anchors.title.size}px ${fontStack("unifraktur")}`;
  anchors.titleLines.forEach((line, index) => {
    const y = anchors.title.y + index * anchors.title.lineHeight;
    context.shadowColor = "rgba(216,204,178,0.55)";
    context.shadowBlur = 18;
    context.fillStyle = TEXT;
    context.fillText(line, anchors.title.x, y);
  });
  context.shadowBlur = 0;
  context.font = `italic 22px ${fontStack("imFellItalic")}`;
  context.fillStyle = GOLD;
  context.fillText(labels.date, anchors.date.x, anchors.date.y);
  if (labels.hasEvent) {
    context.fillStyle = TEXT;
    context.fillText(labels.event, anchors.event.x, anchors.event.y);
  }
  context.restore();
}
