/**
 * Public entry point for the themed-frame design-unit toolkit.
 *
 * This barrel preserves the original `./units.js` import surface so every frame
 * renderer keeps importing from here, while the implementation is split into
 * focused modules:
 *   - designUnits: layout sizes, slot rectangles and copy anchors
 *   - slotPainting: drawing photos / cells / placeholders into slots
 *   - primitives: low-level canvas path helpers
 */
export {
  DESIGN_UNITS,
  DESIGN_LAYOUT_KEYS,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
} from "./units/designUnits.js";
export {
  drawSlotCanvas,
  drawSlotPhoto,
  drawSlotPlaceholder,
} from "./units/slotPainting.js";
export { roundedRectPath } from "./units/primitives.js";
