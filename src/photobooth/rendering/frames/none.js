import {
  PHOTO_HEIGHT,
  PORTRAIT_WIDTH,
  drawPortraitStrip,
  getStripWidth,
} from "../canvas.js";

export function renderNone(canvas, context, participants) {
  const pad = 16;
  const gap = 20;
  canvas.width = getStripWidth(participants.length, pad, gap);
  canvas.height = PHOTO_HEIGHT;
  context.fillStyle = "#202124";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawPortraitStrip(
    context,
    participants,
    pad,
    0,
    PORTRAIT_WIDTH,
    PHOTO_HEIGHT,
    gap,
    0,
    { borderColor: "#f4f5f7", borderWidth: 6 },
  );
}
