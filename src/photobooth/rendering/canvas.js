export function drawMirroredVideo(context, video, x, y, width, height, radius = 0) {
  context.save();
  context.translate(x + width, y);
  context.scale(-1, 1);
  if (radius) {
    drawRoundRectPath(context, 0, 0, width, height, radius);
    context.clip();
  }
  context.drawImage(video, 0, 0, width, height);
  context.restore();
}

export const GROUP_SHOT_WIDTH = 640;
export const GROUP_SHOT_HEIGHT = 480;

/**
 * Chooses a tile grid for a group shot. Cells are filled row-major so a
 * trailing empty cell only ever appears at the end of the last row.
 */
function groupGridShape(count) {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  return { cols: 3, rows: Math.ceil(count / 3) };
}

/**
 * Composes every participant of a single burst moment into one group-shot
 * canvas: all of them tiled side by side (mirrored like the live preview) so a
 * layout cell shows the whole group instead of a single person. The canvas is
 * authored at a 4:3 ratio to match the themed frame slots it is drawn into.
 */
export function composeGroupShot(participants, width = GROUP_SHOT_WIDTH, height = GROUP_SHOT_HEIGHT) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering context is unavailable.");

  context.fillStyle = "#171423";
  context.fillRect(0, 0, width, height);

  const members = (participants || []).filter((participant) => participant?.video);
  if (!members.length) return canvas;

  const { cols, rows } = groupGridShape(members.length);
  const tileWidth = width / cols;
  const tileHeight = height / rows;

  members.forEach(({ video }, index) => {
    const tileX = (index % cols) * tileWidth;
    const tileY = Math.floor(index / cols) * tileHeight;
    const videoWidth = video.videoWidth || video.naturalWidth || video.width || tileWidth;
    const videoHeight = video.videoHeight || video.naturalHeight || video.height || tileHeight;
    const scale = Math.max(tileWidth / videoWidth, tileHeight / videoHeight);
    const sourceWidth = tileWidth / scale;
    const sourceHeight = tileHeight / scale;
    const sourceX = (videoWidth - sourceWidth) / 2;
    const sourceY = (videoHeight - sourceHeight) / 2;

    context.save();
    context.translate(tileX + tileWidth, tileY);
    context.scale(-1, 1);
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      tileWidth,
      tileHeight,
    );
    context.restore();
  });

  return canvas;
}

export function drawRoundRectPath(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}