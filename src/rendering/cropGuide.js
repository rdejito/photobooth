/**
 * Camera crop maths: one source of truth for how the composition turns each
 * participant's camera into a tile, and for the live framing guide that shows a
 * participant which part of their camera survives into the final photo.
 *
 * The final photo is a group shot: `composeGroupShot` cover-crops every camera
 * into a tile of a 4:3 canvas (see canvas.js), then each canvas is cover-cropped
 * into a themed frame slot (see slotPainting.js). `cameraCropRegion` composes
 * those two crops into a single normalized rectangle over the camera frame so
 * the on-screen guide and the composition can never drift apart.
 */
import { getSlotRects } from "./frames/units/designUnits.js";

export const GROUP_SHOT_WIDTH = 640;
export const GROUP_SHOT_HEIGHT = 480;

/**
 * Chooses a tile grid for a group shot. Cells are filled row-major so a
 * trailing empty cell only ever appears at the end of the last row.
 */
export function groupGridShape(count) {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  return { cols: 3, rows: Math.ceil(count / 3) };
}

/** Computes the source rectangle that cover-fits an image into a target box. */
export function coverSource(width, height, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / width, targetHeight / height);
  const sourceWidth = targetWidth / scale;
  const sourceHeight = targetHeight / scale;
  return {
    x: (width - sourceWidth) / 2,
    y: (height - sourceHeight) / 2,
    width: sourceWidth,
    height: sourceHeight,
  };
}

/**
 * The camera source rectangle `composeGroupShot` cover-crops into one tile for
 * a group of `participantCount` participants. `canvasWidth`/`canvasHeight`
 * mirror the group canvas dimensions so the maths track the composition.
 */
export function groupTileSourceRect(
  videoWidth,
  videoHeight,
  participantCount,
  canvasWidth = GROUP_SHOT_WIDTH,
  canvasHeight = GROUP_SHOT_HEIGHT,
) {
  const { cols, rows } = groupGridShape(Math.max(1, participantCount));
  return coverSource(
    videoWidth,
    videoHeight,
    canvasWidth / cols,
    canvasHeight / rows,
  );
}

/**
 * The group-canvas rectangle a themed frame slot cover-crops into, derived from
 * the layout's design-unit slot size. Frame borders are a per-frame cosmetic
 * inset, so the guide intentionally tracks only the selected layout.
 */
export function slotSourceRect(layout) {
  const slot = getSlotRects(layout)[0];
  return coverSource(GROUP_SHOT_WIDTH, GROUP_SHOT_HEIGHT, slot.width, slot.height);
}

/**
 * Normalized `{ x, y, width, height }` (0..1) region of the camera frame that
 * survives into the final photo for `participantIndex` of `participantCount`
 * under `layout`. Mirrors the two centered cover-crops of the composition, so a
 * subject centered in this region stays inside the finished photo.
 */
export function cameraCropRegion({
  videoWidth,
  videoHeight,
  participantCount,
  participantIndex = 0,
  layout = "single-horizontal",
}) {
  const width = videoWidth > 0 ? videoWidth : 4;
  const height = videoHeight > 0 ? videoHeight : 3;
  const count = Math.max(1, participantCount || 1);
  const index = Math.min(Math.max(0, participantIndex), count - 1);

  const { cols, rows } = groupGridShape(count);
  const tileWidth = GROUP_SHOT_WIDTH / cols;
  const tileHeight = GROUP_SHOT_HEIGHT / rows;

  // The camera region this tile shows (a centered cover crop of the camera).
  const tile = groupTileSourceRect(width, height, count);
  const tileFractionX = tile.width / width;
  const tileFractionY = tile.height / height;

  // The group-canvas region the frame slot keeps (a centered cover crop).
  const slot = slotSourceRect(layout);
  const tileX = (index % cols) * tileWidth;
  const tileY = Math.floor(index / cols) * tileHeight;

  const visibleX0 = Math.max(tileX, slot.x);
  const visibleX1 = Math.min(tileX + tileWidth, slot.x + slot.width);
  const visibleY0 = Math.max(tileY, slot.y);
  const visibleY1 = Math.min(tileY + tileHeight, slot.y + slot.height);

  // Degenerate geometry (no overlap): fall back to the whole tile crop.
  if (visibleX1 <= visibleX0 || visibleY1 <= visibleY0) {
    return centeredRegion(tileFractionX, tileFractionY);
  }

  const left = (visibleX0 - tileX) / tileWidth;
  const right = (visibleX1 - tileX) / tileWidth;
  const top = (visibleY0 - tileY) / tileHeight;
  const bottom = (visibleY1 - tileY) / tileHeight;

  // Both crops are centered, so a sub-rect of the tile maps to the same
  // normalized position within the displayed camera frame (mirroring included).
  return {
    x: (1 - tileFractionX) / 2 + left * tileFractionX,
    y: (1 - tileFractionY) / 2 + top * tileFractionY,
    width: (right - left) * tileFractionX,
    height: (bottom - top) * tileFractionY,
  };
}

/** A centered region of the camera of the given fractional size. */
function centeredRegion(fractionX, fractionY) {
  return {
    x: (1 - fractionX) / 2,
    y: (1 - fractionY) / 2,
    width: fractionX,
    height: fractionY,
  };
}

/**
 * Clamps a region to a minimum fractional size so extreme aspect ratios never
 * shrink the guide into an unreadable sliver. The clamped region stays centered
 * on the true region and inside the frame.
 */
export function ensureVisibleRegion(region, minFraction) {
  const min = Math.max(0, Math.min(1, minFraction));
  const width = Math.max(region.width, min);
  const height = Math.max(region.height, min);
  const x = Math.min(
    Math.max(0, region.x - (width - region.width) / 2),
    1 - width,
  );
  const y = Math.min(
    Math.max(0, region.y - (height - region.height) / 2),
    1 - height,
  );
  return { x, y, width, height };
}
