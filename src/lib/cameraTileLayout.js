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
 *
 * Which arrangement fits best depends on the stage's shape: two landscape
 * cameras read better stacked on a portrait phone, while four portrait cameras
 * read better in one row on a wide desktop. `chooseColumns` scores the balanced
 * candidates and keeps the one whose shared height grows largest, i.e. the one
 * that leaves the least dead space.
 */

/** Default grid columns for a participant count: one alone, otherwise two. */
export function stageColumns(participantCount) {
  return participantCount <= 1 ? 1 : 2;
}

/**
 * Balanced column counts worth scoring for a group. Every option either fills
 * its last row or leaves exactly one trailing tile (three people in two
 * columns), so a partial row can never push a wide tile out of its cell.
 *
 * @param {number} participantCount - Number of tiles to arrange.
 * @returns {number[]} Candidate column counts, ascending.
 */
export function columnOptions(participantCount) {
  if (participantCount <= 1) return [1];
  if (participantCount === 2) return [1, 2];
  if (participantCount === 3) return [1, 2, 3];
  return [1, 2, 4];
}

/**
 * Picks the arrangement that fills the stage best by maximising the shared tile
 * height (total tile area) across the balanced candidates. Ties keep the
 * simplest, fewest-column arrangement.
 *
 * @param {object} input - Same fields as `computeTileBoxes`.
 * @returns {number} Best column count; `stageColumns` before measurement.
 */
export function chooseColumns({
  ratios = [],
  containerWidth = 0,
  containerHeight = 0,
  gapX = 0,
  gapY = 0,
} = {}) {
  const count = ratios.length;
  if (!count) return 1;
  if (containerWidth <= 0 || containerHeight <= 0) return stageColumns(count);

  let best = stageColumns(count);
  let bestHeight = -1;
  for (const columns of columnOptions(count)) {
    const [first] = computeTileBoxes({
      ratios,
      containerWidth,
      containerHeight,
      columns,
      gapX,
      gapY,
    });
    const tileHeight = first?.height ?? 0;
    if (tileHeight > bestHeight + 0.5) {
      bestHeight = tileHeight;
      best = columns;
    }
  }
  return best;
}

/**
 * Fits camera aspect ratios into the stage with a shared tile height.
 *
 * Tiles are laid out in equal-width grid tracks, so the shared height must also
 * let each column's widest camera fit its track. A lone tile in a partial final
 * row spans the whole grid, so it is limited by the full stage width instead.
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
  const trackWidth = Math.max(0, width - gapX * (cols - 1)) / cols;
  const trailingIndex = cols > 1 && count % cols === 1 ? count - 1 : -1;

  // The grid itself must fit the stage height; each row must fit the width.
  let tileHeight = rows > 0 ? Math.max(0, height - gapY * (rows - 1)) / rows : 0;
  for (let row = 0; row < rows; row += 1) {
    const rowRatios = ratios.slice(row * cols, row * cols + cols);
    const rowRatio = rowRatios.reduce((sum, ratio) => sum + (ratio > 0 ? ratio : 0), 0);
    if (rowRatio <= 0) continue;
    const rowWidth = width - gapX * Math.max(0, rowRatios.length - 1);
    tileHeight = Math.min(tileHeight, Math.max(0, rowWidth) / rowRatio);
  }

  // Equal tracks: each tile must also fit the column it occupies, except a
  // trailing tile that spans the full grid width.
  ratios.forEach((ratio, index) => {
    if (ratio <= 0) return;
    const limit = index === trailingIndex ? width : trackWidth;
    tileHeight = Math.min(tileHeight, limit / ratio);
  });

  return ratios.map((ratio) => ({
    width: tileHeight * (ratio > 0 ? ratio : 4 / 3),
    height: tileHeight,
  }));
}
