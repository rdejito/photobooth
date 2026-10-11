import {
  GROUP_SHOT_HEIGHT,
  GROUP_SHOT_WIDTH,
  groupTileFrames,
  groupTileSourceRect,
} from "./cropGuide.js";

export { GROUP_SHOT_HEIGHT, GROUP_SHOT_WIDTH };

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

  const frames = groupTileFrames(members.length);

  members.forEach(({ video }, index) => {
    const frame = frames[index];
    const tileX = frame.x * width;
    const tileY = frame.y * height;
    const tileWidth = frame.width * width;
    const tileHeight = frame.height * height;
    const videoWidth = video.videoWidth || video.naturalWidth || video.width || tileWidth;
    const videoHeight = video.videoHeight || video.naturalHeight || video.height || tileHeight;
    const {
      x: sourceX,
      y: sourceY,
      width: sourceWidth,
      height: sourceHeight,
    } = groupTileSourceRect(videoWidth, videoHeight, members.length, width, height);

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