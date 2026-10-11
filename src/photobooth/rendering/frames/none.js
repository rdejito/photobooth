import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
} from "./units.js";
import { normalizeParticipants } from "./shared.js";

/** Plain unframed photos on a soft dark background — the literal "no frame". */
export function renderNone(canvas, context, participants, options = {}) {
  const layout = DESIGN_UNITS[options.layout] ? options.layout : "single-horizontal";
  const { width, height } = getDesignUnits(layout);
  const slots = getSlotRects(layout);
  const frames = options.groupShots?.length
    ? options.groupShots
    : normalizeParticipants(participants);

  canvas.width = width;
  canvas.height = height;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#202124";
  context.fillRect(0, 0, width, height);

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#f4f5f7",
      borderWidth: 6,
      borderRadius: 0,
      placeholderFill: "#3a3d44",
      placeholderInk: "#aeb3ba",
      labelColor: "#d3d6db",
      labelFont: "400 18px monospace",
    });
  });
}