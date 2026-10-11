/**
 * Paper-craft path helpers for the Scrapbook frame: a torn paper edge built
 * from deterministic noise, and hand-drawn writing guide lines.
 */
import { seededNoise } from "../shared.js";

/** A torn paper edge path from deterministic noise (stable between renders). */
export function tornPath(context, x, y, width, height, seed) {
  context.beginPath();
  context.moveTo(x, y + 6);
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const px = x + (width * i) / steps;
    context.lineTo(px, y + seededNoise(seed + i) * 10);
  }
  for (let i = 0; i <= steps; i += 1) {
    const py = y + (height * i) / steps;
    context.lineTo(x + width - 4 + seededNoise(seed + 40 + i) * 8, py);
  }
  for (let i = 0; i <= steps; i += 1) {
    const px = x + width - (width * i) / steps;
    context.lineTo(px, y + height - 4 + seededNoise(seed + 80 + i) * 8);
  }
  for (let i = 0; i <= steps; i += 1) {
    const py = y + height - (height * i) / steps;
    context.lineTo(x + seededNoise(seed + 120 + i) * 8, py);
  }
  context.closePath();
}

/** Faint wavy writing lines, as on a blank note. */
export function drawHandwritingLines(context, x, y, width, count, color) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 1.4;
  for (let index = 0; index < count; index += 1) {
    const ly = y + index * 16;
    context.beginPath();
    context.moveTo(x, ly);
    for (let px = 0; px <= width; px += 10) {
      context.lineTo(x + px, ly + Math.sin((px + index * 12) / 14) * 2.2);
    }
    context.stroke();
  }
  context.restore();
}
