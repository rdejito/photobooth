import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
} from "./units.js";
import {
  fontStack,
  getCachedBackground,
  normalizeParticipants,
  resolveFrameLabels,
} from "./shared.js";
import { frameBorderWidth } from "../../lib/constants.js";

const BG = "#0A0A18";
const CYAN = "#00F0FF";
const MAGENTA = "#FF2E88";

function drawGrid(context, width, height) {
  context.save();
  context.strokeStyle = "rgba(0,240,255,0.07)";
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 32) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();
}

function drawScanlines(context, width, height) {
  context.save();
  context.fillStyle = "rgba(0,0,0,0.16)";
  for (let y = 0; y < height; y += 4) {
    context.fillRect(0, y, width, 1.5);
  }
  context.restore();
}

/** Cyan/magenta corner brackets framing the whole canvas. */
function drawCornerBrackets(context, width, height) {
  const size = 46;
  const corners = [
    { x: 10, y: 10, sx: 1, sy: 1 },
    { x: width - 10, y: 10, sx: -1, sy: 1 },
    { x: 10, y: height - 10, sx: 1, sy: -1 },
    { x: width - 10, y: height - 10, sx: -1, sy: -1 },
  ];
  corners.forEach(({ x, y, sx, sy }, index) => {
    context.save();
    context.strokeStyle = index % 2 === 0 ? CYAN : MAGENTA;
    context.lineWidth = 4;
    context.shadowColor = context.strokeStyle;
    context.shadowBlur = 14;
    context.beginPath();
    context.moveTo(x + sx * size, y);
    context.lineTo(x, y);
    context.lineTo(x, y + sy * size);
    context.stroke();
    context.restore();
  });
}

/** Magenta bracket corners hugging a slot. */
function drawSlotBrackets(context, slot) {
  const size = 18;
  const corners = [
    { x: slot.x, y: slot.y, sx: 1, sy: 1 },
    { x: slot.x + slot.width, y: slot.y, sx: -1, sy: 1 },
    { x: slot.x, y: slot.y + slot.height, sx: 1, sy: -1 },
    { x: slot.x + slot.width, y: slot.y + slot.height, sx: -1, sy: -1 },
  ];
  context.save();
  context.strokeStyle = MAGENTA;
  context.lineWidth = 3;
  context.shadowColor = MAGENTA;
  context.shadowBlur = 10;
  corners.forEach(({ x, y, sx, sy }) => {
    context.beginPath();
    context.moveTo(x + sx * size, y);
    context.lineTo(x, y);
    context.lineTo(x, y + sy * size);
    context.stroke();
  });
  context.restore();
}

/** Glitch-split title: magenta and cyan offsets, then the text. */
function drawGlitchTitle(context, anchors) {
  context.save();
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.font = `800 ${anchors.title.size}px ${fontStack("orbitron")}`;
  anchors.titleLines.forEach((line, index) => {
    const y = anchors.title.y + index * anchors.title.lineHeight;
    context.fillStyle = MAGENTA;
    context.fillText(line, anchors.title.x - 4, y + 2);
    context.fillStyle = CYAN;
    context.fillText(line, anchors.title.x + 4, y - 2);
    context.fillStyle = "#EAFBFF";
    context.shadowColor = CYAN;
    context.shadowBlur = 12;
    context.fillText(line, anchors.title.x, y);
    context.shadowBlur = 0;
  });
  context.restore();
}

function drawSmileTag(context, x, y) {
  context.save();
  context.font = `400 18px ${fontStack("shareTechMono")}`;
  const width = context.measureText("SMILE.EXE").width + 28;
  context.strokeStyle = CYAN;
  context.lineWidth = 2;
  context.strokeRect(x - width / 2, y - 16, width, 32);
  context.fillStyle = CYAN;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("SMILE.EXE", x, y + 1);
  context.restore();
}

export function renderCyberpunk(canvas, context, participants, options = {}) {
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
    key: "cyberpunk:bg",
    width: designWidth,
    height: designHeight,
    draw: (bgContext, w, h) => {
      bgContext.fillStyle = BG;
      bgContext.fillRect(0, 0, w, h);
      drawGrid(bgContext, w, h);
      drawScanlines(bgContext, w, h);
    },
  });
  context.drawImage(background, 0, 0);

  slots.forEach((slot) => {
    context.save();
    context.strokeStyle = CYAN;
    context.lineWidth = 2;
    context.shadowColor = CYAN;
    context.shadowBlur = 16;
    context.strokeRect(slot.x, slot.y, slot.width, slot.height);
    context.restore();
  });

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#0E1630",
      borderWidth: frameBorderWidth("cyberpunk"),
      placeholderFill: "#101A2E",
      placeholderInk: CYAN,
      labelColor: "rgba(0,240,255,0.75)",
      labelFont: `400 20px ${fontStack("shareTechMono")}`,
    });
    drawSlotBrackets(context, slot);
  });

  drawCornerBrackets(context, designWidth, designHeight);
  drawGlitchTitle(context, anchors);
  drawSmileTag(context, anchors.emblem.x, anchors.emblem.y);

  context.save();
  context.font = `400 20px ${fontStack("shareTechMono")}`;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillStyle = CYAN;
  // Inset from the right corner bracket so the label never overlaps it.
  context.textAlign = "right";
  context.fillText(`// DATE ${labels.date}`, designWidth - 30, anchors.date.y);
  if (labels.hasEvent) {
    context.fillStyle = MAGENTA;
    context.textAlign = "center";
    context.fillText(`// ${labels.event}`, anchors.event.x, anchors.event.y);
  }
  context.restore();
}
