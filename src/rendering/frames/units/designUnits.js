/**
 * Design-unit geometry shared by every themed frame renderer.
 *
 * A themed frame is authored once in fixed "design units" per layout and then
 * scaled to the real canvas by a single context transform. Keeping the geometry
 * here means one template works at every output resolution, and every theme
 * decorates the same four slot rectangles.
 */

/** Canvas size, in design units, for each supported photo layout. */
export const DESIGN_UNITS = {
  "single-horizontal": { width: 1280, height: 360 },
  "single-vertical": { width: 340, height: 1090 },
  "grid-2x2": { width: 720, height: 696 },
};

export const DESIGN_LAYOUT_KEYS = Object.keys(DESIGN_UNITS);

/** Resolves a layout to its design-unit size, defaulting to horizontal. */
export function getDesignUnits(layout) {
  return DESIGN_UNITS[layout] || DESIGN_UNITS["single-horizontal"];
}

/**
 * Slot geometry in design units for a layout: four 4:3 photo rectangles laid
 * out horizontally, vertically or as a 2x2 grid. Themes decide how to decorate
 * around these rectangles; the rectangles themselves are shared.
 */
const SLOT_BOXES = {
  // Horizontal is wide and short: slots sit between a top title band and a
  // bottom label band, so both stay inside the canvas.
  "single-horizontal": { x: 30, y: 78, w: 286, h: 200, gap: 24 },
  "single-vertical": { x: 30, y: 158, w: 280, h: 195, gap: 30 },
  "grid-2x2": { x: 44, y: 104, w: 307, h: 230, gap: 34 },
};

/** Returns the four slot rectangles for a layout as `{ x, y, width, height }`. */
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
 * title (one or two lines), date, event label, emblem and accent dots.
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
