export const PHOTO_WIDTH = 640;
export const PHOTO_HEIGHT = 480;
export const PORTRAIT_WIDTH = 320;

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

export function getStripWidth(count, padding, gap, tileWidth = PORTRAIT_WIDTH) {
  return padding * 2 + count * tileWidth + Math.max(0, count - 1) * gap;
}

export function drawFrameSideRail(context, x, y, width, height, theme) {
  context.fillStyle = theme.background;
  context.fillRect(x, y, width, height);
  context.fillStyle = theme.accent;
  context.fillRect(x + 2, y, 2, height);
  context.fillRect(x + width - 4, y, 2, height);

  for (let markY = y + 16; markY < y + height - 8; markY += 34) {
    if (theme.pattern === "pixels") {
      context.fillRect(x + 7, markY, width - 14, 4);
      context.fillStyle = theme.detail || theme.accent;
      context.fillRect(x + 11, markY + 6, width - 22, 3);
      context.fillStyle = theme.accent;
    } else if (theme.pattern === "medallions") {
      context.beginPath();
      context.arc(x + width / 2, markY + 4, 3, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = theme.detail || theme.accent;
      context.fillRect(x + width / 2 - 1, markY + 11, 2, 7);
      context.fillStyle = theme.accent;
    } else {
      context.beginPath();
      context.moveTo(x + width / 2, markY);
      context.lineTo(x + width / 2 + 4, markY + 4);
      context.lineTo(x + width / 2, markY + 8);
      context.lineTo(x + width / 2 - 4, markY + 4);
      context.closePath();
      context.fill();
      context.fillStyle = theme.detail || theme.accent;
      context.fillRect(x + 3, markY + 3, 2, 2);
      context.fillRect(x + width - 5, markY + 3, 2, 2);
      context.fillStyle = theme.accent;
    }
  }
}

export function drawOuterFrameRails(context, canvasWidth, y, height, width, theme) {
  const inset = 12;
  drawFrameSideRail(context, inset, y, width, height, theme);
  drawFrameSideRail(context, canvasWidth - inset - width, y, width, height, theme);
}

export function drawPortraitStrip(
  context,
  participants,
  x,
  y,
  tileWidth = PORTRAIT_WIDTH,
  tileHeight = PHOTO_HEIGHT,
  gap = 10,
  radius = 10,
) {
  participants.forEach(({ video }, index) => {
    const videoWidth = video.videoWidth || tileWidth;
    const videoHeight = video.videoHeight || tileHeight;
    const scale = Math.max(tileWidth / videoWidth, tileHeight / videoHeight);
    const sourceWidth = tileWidth / scale;
    const sourceHeight = tileHeight / scale;
    const sourceX = (videoWidth - sourceWidth) / 2;
    const sourceY = (videoHeight - sourceHeight) / 2;
    const tileX = x + index * (tileWidth + gap);

    context.save();
    context.translate(tileX + tileWidth, y);
    context.scale(-1, 1);
    drawRoundRectPath(context, 0, 0, tileWidth, tileHeight, radius);
    context.clip();
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
