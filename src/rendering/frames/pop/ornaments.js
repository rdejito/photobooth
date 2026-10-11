/**
 * Decorative painters for the Pop family: the background pattern, the film-hole
 * dashes, the "SMILE!" starburst and the camera-badge emblem.
 */
import { roundedRectPath } from "../units.js";
import { drawSparkle } from "../shared.js";

/**
 * Fills the frame with its pattern: a dot field, or a 44px grid for noir.
 * Called on the cached background canvas, so it runs once per size.
 */
export function drawPattern(context, width, height, palette) {
  if (palette.pattern === "grid") {
    context.save();
    context.strokeStyle = palette.gridColor;
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 44) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y <= height; y += 44) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();
    return;
  }

  context.save();
  context.fillStyle = palette.dotColor;
  const step = 26;
  const radius = 3;
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

/** Film-hole dashes along the two long edges of the frame. */
export function drawFilmHoles(context, width, height, palette) {
  const vertical = height > width;
  const holeCount = vertical ? Math.floor(height / 34) : Math.floor(width / 34);
  const spacing = (vertical ? height : width) / holeCount;
  context.save();
  context.fillStyle = palette.pop;
  for (let index = 0; index < holeCount; index += 1) {
    const along = spacing * (index + 0.5);
    const hole = vertical
      ? { x: 12, y: along, w: 10, h: 16 }
      : { x: along, y: 12, w: 16, h: 10 };
    context.beginPath();
    roundedRectPath(context, hole.x, hole.y, hole.w, hole.h, 4);
    context.fill();
    const far = vertical
      ? { x: width - 22, y: along, w: 10, h: 16 }
      : { x: along, y: height - 22, w: 16, h: 10 };
    context.beginPath();
    roundedRectPath(context, far.x, far.y, far.w, far.h, 4);
    context.fill();
  }
  context.restore();
}

/** "SMILE!" starburst drawn as an alternating-radius polygon. */
export function drawStarburst(context, x, y, outer, inner, points, fill, textColor, font) {
  context.save();
  context.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const angle = (Math.PI * index) / points - Math.PI / 2;
    const radius = index % 2 === 0 ? outer : inner;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fillStyle = fill;
  context.fill();
  context.fillStyle = textColor;
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("SMILE!", x, y + 1);
  context.restore();
}

/** Signature emblem: a small camera badge with a sparkle burst. */
export function drawEmblem(context, x, y, palette, ink) {
  context.save();
  context.beginPath();
  roundedRectPath(context, x - 26, y - 20, 52, 40, 10);
  context.fillStyle = palette.accent;
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = ink;
  context.stroke();
  context.beginPath();
  context.arc(x, y, 11, 0, Math.PI * 2);
  context.fillStyle = palette.frame;
  context.fill();
  context.beginPath();
  context.arc(x, y, 5, 0, Math.PI * 2);
  context.fillStyle = palette.pop;
  context.fill();
  drawSparkle(context, x - 30, y - 26, 7, palette.pop);
  drawSparkle(context, x + 32, y + 24, 6, ink);
  context.restore();
}
