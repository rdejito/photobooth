/**
 * Low-level canvas path primitives shared across frame renderers and the slot
 * painting helpers. Keeping them in one place avoids divergent round-rect maths
 * between frames.
 */

/**
 * Appends a rounded-rectangle path to the current path. The radius is clamped
 * so an over-large value degrades gracefully to a pill/circle instead of an
 * inverted arc.
 */
export function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
