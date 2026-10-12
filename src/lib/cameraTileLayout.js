/**
 * Live camera-stage tile layout.
 *
 * Rooms mix devices, so each participant's camera has its own aspect ratio (a
 * phone's tall 9:16 versus a desktop's wide 16:9). Sizing every tile from its
 * own ratio alone makes a row look ragged: a landscape tile ends up short next
 * to a tall portrait one. Instead every tile shares one height, chosen so the
 * widest row still fits the stage width and the stacked rows still fit its
 * height. Each tile keeps its own ratio, so nothing is distorted and the live
 * crop guide (which assumes the tile matches the camera) stays accurate.
 */

/** Grid columns for a participant count: one alone, otherwise two per row. */
export function stageColumns(participantCount) {
  return participantCount <= 1 ? 1 : 2;
}

/**
 * Fits camera aspect ratios into the stage with a shared tile height.
 *
 * @param {object} input
 * @param {number[]} input.ratios - width/height of each tile, in order.
 * @param {number} input.containerWidth - Available stage width in pixels.
 * @param {number} input.containerHeight - Available stage height in pixels.
 * @param {number} [input.columns] - Tiles per row (defaults to one row).
 * @param {number} [input.gapX] - Horizontal gap between tiles, in pixels.
 * @param {number} [input.gapY] - Vertical gap between rows, in pixels.
 * @returns {Array<{ width: number, height: number }>} One box per ratio.
 */
export function computeTileBoxes({
  ratios = [],
  containerWidth = 0,
  containerHeight = 0,
  columns = 1,
  gapX = 0,
  gapY = 0,
} = {}) {
  const count = ratios.length;
  if (!count) return [];

  const cols = Math.max(1, Math.min(Math.floor(columns) || 1, count));
  const rows = Math.ceil(count / cols);
  const width = Math.max(0, containerWidth);
  const height = Math.max(0, containerHeight);

  // The grid itself must fit the stage height; each row must fit the width.
  let tileHeight = rows > 0 ? Math.max(0, height - gapY * (rows - 1)) / rows : 0;
  for (let row = 0; row < rows; row += 1) {
    const rowRatios = ratios.slice(row * cols, row * cols + cols);
    const rowRatio = rowRatios.reduce((sum, ratio) => sum + (ratio > 0 ? ratio : 0), 0);
    if (rowRatio <= 0) continue;
    const rowWidth = width - gapX * Math.max(0, rowRatios.length - 1);
    tileHeight = Math.min(tileHeight, Math.max(0, rowWidth) / rowRatio);
  }

  return ratios.map((ratio) => ({
    width: tileHeight * (ratio > 0 ? ratio : 4 / 3),
    height: tileHeight,
  }));
}
