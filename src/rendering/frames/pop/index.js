/**
 * One parameterized renderer for the Pop family: pop, blush, noir, mint.
 *
 * The template is authored in design units and scaled to the real canvas, so it
 * composes at any output resolution. Only the palette (and the background
 * pattern kind) changes between themes. Ornaments and copy live in sibling
 * modules; this entry point lays out the frame.
 */
import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
} from "../units.js";
import {
  fontStack,
  getCachedBackground,
  normalizeParticipants,
  resolveFrameLabels,
  drawSparkle,
} from "../shared.js";
import { frameBorderWidth } from "../../../lib/constants.js";
import { POP_PALETTES } from "./palettes.js";
import { drawEmblem, drawFilmHoles, drawPattern, drawStarburst } from "./ornaments.js";
import { drawAssignments, drawTitle } from "./copy.js";

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
      `700 ${Math.round(34 * 0.62)}px ${fontStack("archivoBlack")}`,
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
      borderWidth: frameBorderWidth(themeKey),
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
