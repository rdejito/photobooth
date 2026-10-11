import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
  roundedRectPath,
} from "./units.js";
import {
  getCachedBackground,
  normalizeParticipants,
  resolveFrameLabels,
} from "./shared.js";

const DESK_TOP = "#e8ded1";
const DESK_BOTTOM = "#cfc0b2";
const CARD = "#fffdf8";

export function renderPolaroid(canvas, context, participants, options = {}) {
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

  const desk = getCachedBackground({
    key: "polaroid:desk",
    width,
    height,
    draw: (ctx, w, h) => {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, DESK_TOP);
      gradient.addColorStop(1, DESK_BOTTOM);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    },
  });
  context.drawImage(desk, 0, 0);

  // Bottom padding is kept small so the shared date/event anchors stay clear of
  // the last card even on the tight vertical layout.
  const pad = 12;
  const padBottom = layout === "single-vertical" ? 2 : 10;
  slots.forEach((slot) => {
    context.save();
    context.shadowColor = "rgba(66,48,38,0.3)";
    context.shadowBlur = 12;
    context.shadowOffsetY = 5;
    context.fillStyle = CARD;
    roundedRectPath(
      context,
      slot.x - pad,
      slot.y - pad,
      slot.width + pad * 2,
      slot.height + pad + padBottom,
      9,
    );
    context.fill();
    context.restore();
  });

  context.textAlign = "center";
  context.fillStyle = "#5e5148";
  context.font = `bold ${anchors.title.size}px 'Courier New', monospace`;
  anchors.titleLines.forEach((line, index) => {
    context.fillText(line, width / 2, anchors.title.y + index * anchors.title.lineHeight);
  });

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#f5eee3",
      borderWidth: 3,
      borderRadius: 4,
      placeholderFill: "#e8ddcc",
      placeholderInk: "#a58d79",
      labelColor: "#86766b",
      labelFont: "italic 18px Georgia, serif",
    });
  });

  context.fillStyle = "#5e5148";
  context.font = `400 ${Math.round(anchors.title.size / 2)}px 'Courier New', monospace`;
  context.fillText(labels.date, width / 2, anchors.date.y);
  if (labels.hasEvent) {
    context.font = "italic 18px Georgia, serif";
    context.fillText(labels.event, width / 2, anchors.event.y);
  }
}