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
import { frameBorderWidth } from "../../lib/constants.js";

const TABLE = "#CFCBBE";
const STRIP = "#141414";
const AMBER = "#E8A33D";
const GREASE = "#D9342B";

function drawGrain(context, width, height) {
  context.save();
  context.fillStyle = "rgba(120,116,104,0.09)";
  for (let index = 0; index < 1400; index += 1) {
    const x = seededNoise(index * 3.1) * width;
    const y = seededNoise(index * 7.7 + 1) * height;
    context.fillRect(x, y, 1.5, 1.5);
  }
  context.restore();
}

/** Sprocket holes are cut out of the strip so the light table shows through. */
function punchSprockets(context, width, height) {
  context.save();
  context.globalCompositeOperation = "destination-out";
  [14, width - 34].forEach((x) => {
    for (let y = 22; y < height - 16; y += 34) {
      context.beginPath();
      roundedRectPath(context, x, y, 20, 14, 4);
      context.fill();
    }
  });
  context.restore();
}

function drawEdgePrint(context, width, height, labels) {
  context.save();
  context.fillStyle = AMBER;
  context.font = `400 9px ${fontStack("dmMono")}`;
  context.textBaseline = "middle";
  context.textAlign = "left";
  context.translate(width / 2, height / 2);
  context.rotate(Math.PI / 2);
  context.fillText("LITTLE MOMENTS", -height / 2 + 24, -width / 2 + 16);
  context.fillText("1A  ► 1", -height / 2 + 24, -width / 2 + 32);
  context.restore();

  context.save();
  context.fillStyle = AMBER;
  context.font = `400 9px ${fontStack("dmMono")}`;
  context.textBaseline = "middle";
  context.textAlign = "right";
  context.fillText(labels.date.toUpperCase(), width - 18, height - 22);
  context.restore();
}

/** Fixed grease-pencil loop around frame 2 (never random). */
function drawGreaseLoop(context, slot) {
  context.save();
  context.strokeStyle = GREASE;
  context.lineWidth = 3;
  context.globalAlpha = 0.9;
  context.lineCap = "round";
  const x = slot.x - 8;
  const y = slot.y - 8;
  const w = slot.width + 16;
  const h = slot.height + 16;
  context.beginPath();
  context.moveTo(x + 6, y + h * 0.35);
  context.bezierCurveTo(x - 6, y - 4, x + w * 0.4, y - 10, x + w - 4, y + 4);
  context.bezierCurveTo(x + w + 8, y + h * 0.5, x + w - 2, y + h + 8, x + w * 0.5, y + h + 6);
  context.bezierCurveTo(x + w * 0.1, y + h + 10, x - 10, y + h * 0.7, x + 2, y + h * 0.3);
  context.stroke();
  context.restore();
}

function drawMaskingTape(context, x, y, width, angle, alpha = 0.85) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.globalAlpha = alpha;
  context.fillStyle = "#E9DDBE";
  context.fillRect(-width / 2, -11, width, 22);
  context.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = -width / 2 + 4; i < width / 2 - 2; i += 9) {
    context.fillRect(i, -9, 2, 18);
  }
  context.restore();
}

function drawStickerLabel(context, labels, anchors) {
  const x = anchors.event.x - 120;
  const y = anchors.event.y - 34;
  const width = 240;
  const height = labels.hasEvent ? 66 : 40;
  context.save();
  context.shadowColor = "rgba(20,20,20,0.28)";
  context.shadowBlur = 10;
  context.shadowOffsetY = 4;
  context.fillStyle = "#F7F2E6";
  context.fillRect(x, y, width, height);
  context.restore();
  context.save();
  context.fillStyle = GREASE;
  context.fillRect(x, y, 8, height);
  context.fillStyle = "#3A3630";
  context.font = `700 15px ${fontStack("dmMono")}`;
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(labels.date, x + 22, y + (labels.hasEvent ? 22 : height / 2));
  if (labels.hasEvent) {
    context.fillStyle = "#6B655B";
    context.font = `400 13px ${fontStack("dmMono")}`;
    context.fillText(labels.event, x + 22, y + 44);
  }
  context.restore();
}

export function renderFilm(canvas, context, participants, options = {}) {
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
    key: "film:table",
    width: designWidth,
    height: designHeight,
    draw: (bgContext, w, h) => {
      bgContext.fillStyle = TABLE;
      bgContext.fillRect(0, 0, w, h);
      drawGrain(bgContext, w, h);
    },
  });
  context.drawImage(background, 0, 0);

  const strip = getCachedBackground({
    key: `film:strip:${layout}`,
    width: designWidth,
    height: designHeight,
    draw: (bgContext, w, h) => {
      bgContext.setTransform(1, 0, 0, 1, 0, 0);
      bgContext.translate(w / 2, h / 2);
      bgContext.rotate(-0.6 * (Math.PI / 180));
      bgContext.translate(-w / 2, -h / 2);
      bgContext.shadowColor = "rgba(20,20,20,0.4)";
      bgContext.shadowBlur = 22;
      bgContext.shadowOffsetY = 10;
      bgContext.fillStyle = STRIP;
      bgContext.fillRect(6, 6, w - 12, h - 12);
      bgContext.shadowColor = "transparent";
      punchSprockets(bgContext, w, h);
    },
  });
  context.save();
  context.translate(designWidth / 2, designHeight / 2);
  context.rotate(-0.6 * (Math.PI / 180));
  context.translate(-designWidth / 2, -designHeight / 2);
  context.drawImage(strip, 0, 0);
  context.restore();

  drawEdgePrint(context, designWidth, designHeight, labels);

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#F5F0E6",
      borderWidth: frameBorderWidth("film"),
      placeholderFill: "#2A2A2A",
      placeholderInk: "#8F8A80",
      labelColor: "#B9B2A4",
      labelFont: `400 20px ${fontStack("dmMono")}`,
    });
  });

  drawGreaseLoop(context, slots[1]);
  drawMaskingTape(context, slots[0].x - 14, slots[0].y - 10, 92, -0.5);
  drawMaskingTape(
    context,
    slots[3].x + slots[3].width + 14,
    slots[3].y + slots[3].height + 10,
    92,
    0.45,
  );
  drawStickerLabel(context, labels, anchors);

  context.save();
  context.fillStyle = "#F7F2E6";
  context.font = `italic 600 ${anchors.title.size}px ${fontStack("playfair")}`;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  anchors.titleLines.forEach((line, index) => {
    context.fillText(line, anchors.title.x, anchors.title.y + index * anchors.title.lineHeight);
  });
  context.restore();
}
