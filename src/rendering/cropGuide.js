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
 * trailing empty cell only ever appears at the end of the last row. A group of
 * three uses a single row of three vertical tiles.
 */
export function groupGridShape(count) {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count === 3) return { cols: 3, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  return { cols: 3, rows: Math.ceil(count / 3) };
}

/**
 * The tile rectangle, as fractions of the group canvas, for each participant
 * slot. Tiles fill the grid `groupGridShape` picks, row-major; a three-person
 * group is the exception and uses `threeUpFrames`.
 */
export function groupTileFrames(count) {
  if (count === 3) return threeUpFrames();

  const size = Math.max(1, count);
  const { cols, rows } = groupGridShape(size);
  const width = 1 / cols;
  const height = 1 / rows;
  return Array.from({ length: size }, (_, index) => ({
    x: (index % cols) * width,
    y: Math.floor(index / cols) * height,
    width,
    height,
  }));
}

/** Width:height ratio of each portrait tile in the three-person layout. */
const THREE_UP_TILE_RATIO = 3 / 4;

/**
 * Frames for a three-person group: three portrait (3:4) tiles in a row,
 * centred vertically so each camera keeps more of its width instead of being
 * stretched into a full-height sliver. The leftover canvas reads as a margin
 * above and below the tiles.
 */
function threeUpFrames() {
  const width = 1 / 3;
  // The canvas is 4:3, so a tile one third as wide is `canvasAspect / (3 *
  // ratio)` of the canvas tall.
  const height = (GROUP_SHOT_WIDTH / GROUP_SHOT_HEIGHT) / (3 * THREE_UP_TILE_RATIO);
  const y = (1 - height) / 2;
  return [0, 1, 2].map((index) => ({ x: index * width, y, width, height }));
}

/**
 * Composition crop focus. Horizontal crops stay centered; when a tall stream
 * (a phone held upright) is cropped into a wider tile, the vertical crop keeps
 * the upper part of the frame so heads survive and only the lower body is
 * trimmed. The same focus feeds both the composition and the live guide, so
 * they can never disagree.
 */
export const GROUP_TILE_FOCUS = { x: 0.5, y: 0.15 };

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

/**
 * Computes the source rectangle that cover-fits an image into a target box.
 * `focus` (0..1) picks where the crop sits on each axis: 0.5 is centered and
 * the default, so callers that don't care get the original centred crop.
 */
export function coverSource(
  width,
  height,
  targetWidth,
  targetHeight,
  focus = { x: 0.5, y: 0.5 },
) {
  const scale = Math.max(targetWidth / width, targetHeight / height);
  const sourceWidth = targetWidth / scale;
  const sourceHeight = targetHeight / scale;
  return {
    x: (width - sourceWidth) * clamp01(focus.x ?? 0.5),
    y: (height - sourceHeight) * clamp01(focus.y ?? 0.5),
    width: sourceWidth,
    height: sourceHeight,
  };
}

/**
 * The camera source rectangle `composeGroupShot` cover-crops into one tile for
 * a group of `participantCount` participants. `canvasWidth`/`canvasHeight`
 * mirror the group canvas dimensions so the maths track the composition. The
 * crop adapts to each stream's ratio: wide streams crop the sides, tall streams
 * crop the bottom, and the focus keeps heads framed.
 */
export function groupTileSourceRect(
  videoWidth,
  videoHeight,
  participantCount,
  canvasWidth = GROUP_SHOT_WIDTH,
  canvasHeight = GROUP_SHOT_HEIGHT,
) {
  const frame = groupTileFrames(Math.max(1, participantCount))[0];
  return coverSource(
    videoWidth,
    videoHeight,
    canvasWidth * frame.width,
    canvasHeight * frame.height,
    GROUP_TILE_FOCUS,
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
 * under `layout`. Mirrors the two cover-crops of the composition — including the
 * adaptive, ratio-aware tile focus — so a subject centered in this region stays
 * inside the finished photo.
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

  const frame = groupTileFrames(count)[index];
  const tileWidth = frame.width * GROUP_SHOT_WIDTH;
  const tileHeight = frame.height * GROUP_SHOT_HEIGHT;

  // The camera region this tile shows (an adaptive cover crop of the camera).
  const tile = groupTileSourceRect(width, height, count);
  const tileFractionX = tile.width / width;
  const tileFractionY = tile.height / height;

  // The group-canvas region the frame slot keeps (a centered cover crop).
  const slot = slotSourceRect(layout);
  const tileX = frame.x * GROUP_SHOT_WIDTH;
  const tileY = frame.y * GROUP_SHOT_HEIGHT;

  const visibleX0 = Math.max(tileX, slot.x);
  const visibleX1 = Math.min(tileX + tileWidth, slot.x + slot.width);
  const visibleY0 = Math.max(tileY, slot.y);
  const visibleY1 = Math.min(tileY + tileHeight, slot.y + slot.height);

  // Degenerate geometry (no overlap): fall back to the whole tile crop.
  if (visibleX1 <= visibleX0 || visibleY1 <= visibleY0) {
    return tileRegion(tile, width, height);
  }

  const left = (visibleX0 - tileX) / tileWidth;
  const right = (visibleX1 - tileX) / tileWidth;
  const top = (visibleY0 - tileY) / tileHeight;
  const bottom = (visibleY1 - tileY) / tileHeight;

  // Map the surviving sub-rect of the tile back through the (possibly
  // off-centre) camera crop so the guide tracks the exact composition crop.
  return {
    x: tile.x / width + left * tileFractionX,
    y: tile.y / height + top * tileFractionY,
    width: (right - left) * tileFractionX,
    height: (bottom - top) * tileFractionY,
  };
}

/** The whole camera region a tile shows, normalized to the camera frame. */
function tileRegion(tile, videoWidth, videoHeight) {
  return {
    x: tile.x / videoWidth,
    y: tile.y / videoHeight,
    width: tile.width / videoWidth,
    height: tile.height / videoHeight,
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
