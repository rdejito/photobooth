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

const CYAN = "#53f6e4";
const MAGENTA = "#ff5bd6";
const RAIL_BG = "#0d1230";

/** Vertical neon rail with pixel-dash marks (design units). */
function drawPixelRail(context, x, y, width, height) {
  context.save();
  context.fillStyle = RAIL_BG;
  context.fillRect(x, y, width, height);
  context.fillStyle = CYAN;
  context.fillRect(x + 2, y, 2, height);
  context.fillRect(x + width - 4, y, 2, height);
  for (let markY = y + 10; markY < y + height - 4; markY += 26) {
    context.fillRect(x + 7, markY, width - 14, 4);
    context.fillStyle = MAGENTA;
    context.fillRect(x + 11, markY + 6, width - 22, 3);
    context.fillStyle = CYAN;
  }
  context.restore();
}

export function renderArcade(canvas, context, participants, options = {}) {
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

  const backdrop = getCachedBackground({
    key: "arcade:backdrop",
    width,
    height,
    draw: (ctx, w, h) => {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, "#090d25");
      gradient.addColorStop(0.5, "#17143b");
      gradient.addColorStop(1, "#271037");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    },
  });
  context.drawImage(backdrop, 0, 0);

  context.strokeStyle = CYAN;
  context.lineWidth = 3;
  context.strokeRect(9, 9, width - 18, height - 18);

  const top = slots[0].y;
  const bottom = Math.max(...slots.map((slot) => slot.y + slot.height));
  const railWidth = 14;
  drawPixelRail(context, 16, top, railWidth, bottom - top);
  drawPixelRail(context, width - 16 - railWidth, top, railWidth, bottom - top);

  const headerY = anchors.title.y - (anchors.title.size - 10);
  context.textAlign = "center";
  context.fillStyle = CYAN;
  context.font = "bold 13px 'Courier New', monospace";
  context.fillText("CO-OP PHOTO MODE", width / 2, headerY);

  context.save();
  context.shadowColor = CYAN;
  context.shadowBlur = 14;
  context.fillStyle = "#ffffff";
  context.font = `bold ${anchors.title.size}px 'Courier New', monospace`;
  anchors.titleLines.forEach((line, index) => {
    context.fillText(line, width / 2, anchors.title.y + index * anchors.title.lineHeight);
  });
  context.restore();

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: CYAN,
      borderWidth: frameBorderWidth("arcade"),
      borderRadius: 4,
      placeholderFill: "#121a3f",
      placeholderInk: "#38d0c0",
      labelColor: "#9fe8ff",
      labelFont: `700 18px ${fontStack("dmMono")}`,
    });
  });

  context.fillStyle = "#ffcc67";
  context.font = "bold 13px 'Courier New', monospace";
  context.textAlign = "center";
  context.fillText(`PHOTO PARTY  ·  ${labels.date}`, width / 2, anchors.date.y);
}