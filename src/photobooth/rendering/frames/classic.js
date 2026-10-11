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

const PAPER_TOP = "#fffaf0";
const PAPER_BOTTOM = "#f6e8d6";
const RAIL_BG = "#f6e8d6";
const RAIL_ACCENT = "#d9a28e";
const RAIL_DETAIL = "#8c5360";
const TITLE_INK = "#33272a";
const FOOTER_INK = "#8c5360";

/** Vertical "picture-frame" rail with diamond ornaments (design units). */
function drawRail(context, x, y, width, height) {
  context.save();
  context.fillStyle = RAIL_BG;
  context.fillRect(x, y, width, height);
  context.fillStyle = RAIL_ACCENT;
  context.fillRect(x + 2, y, 2, height);
  context.fillRect(x + width - 4, y, 2, height);
  for (let markY = y + 12; markY < y + height - 6; markY += 28) {
    context.beginPath();
    context.moveTo(x + width / 2, markY);
    context.lineTo(x + width / 2 + 4, markY + 4);
    context.lineTo(x + width / 2, markY + 8);
    context.lineTo(x + width / 2 - 4, markY + 4);
    context.closePath();
    context.fill();
    context.fillStyle = RAIL_ACCENT;
    context.fillRect(x + 3, markY + 3, 2, 2);
    context.fillRect(x + width - 5, markY + 3, 2, 2);
    context.fillStyle = RAIL_DETAIL;
  }
  context.restore();
}

export function renderClassic(canvas, context, participants, options = {}) {
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

  const paper = getCachedBackground({
    key: "classic:paper",
    width,
    height,
    draw: (ctx, w, h) => {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, PAPER_TOP);
      gradient.addColorStop(1, PAPER_BOTTOM);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    },
  });
  context.drawImage(paper, 0, 0);

  const top = slots[0].y;
  const bottom = Math.max(...slots.map((slot) => slot.y + slot.height));
  const railWidth = 14;
  drawRail(context, 10, top, railWidth, bottom - top);
  drawRail(context, width - 10 - railWidth, top, railWidth, bottom - top);

  const headerY = anchors.title.y - (anchors.title.size - 10);
  context.textAlign = "center";
  context.fillStyle = FOOTER_INK;
  context.font = "bold 13px 'Courier New', monospace";
  context.fillText("A LITTLE MOMENT TO KEEP", width / 2, headerY);
  context.fillStyle = TITLE_INK;
  context.font = `bold ${anchors.title.size}px Georgia, serif`;
  anchors.titleLines.forEach((line, index) => {
    context.fillText(line, width / 2, anchors.title.y + index * anchors.title.lineHeight);
  });

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#fffdf8",
      borderWidth: 7,
      borderRadius: 6,
      placeholderFill: "#efe3d2",
      placeholderInk: "#b0896e",
      labelColor: FOOTER_INK,
      labelFont: `700 18px ${fontStack("dmMono")}`,
    });
  });

  const footer = [labels.date, labels.hasEvent ? labels.event : ""]
    .filter(Boolean)
    .join("  ·  ");
  context.fillStyle = FOOTER_INK;
  context.font = `italic ${Math.round(anchors.title.size / 2)}px Georgia, serif`;
  context.textAlign = "center";
  context.fillText(footer, width / 2, anchors.date.y);
}