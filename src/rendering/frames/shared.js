/**
 * Shared helpers for the themed frame renderers: no-photo placeholders,
 * label text/date/event formatting, font loading and a cached offscreen
 * background painter.
 */

export function formatFrameDate(date = new Date()) {
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsedDate);
  } catch {
    return parsedDate.toLocaleDateString("en-GB", { timeZone: "UTC" });
  }
}

const MAX_EVENT_NAME_LENGTH = 40;

/**
 * Normalises the label inputs for a frame. The event name is optional and is
 * omitted cleanly when empty (see `hasEvent`), so a layout never looks broken.
 * Peer-supplied names are capped to the same length as the input field.
 */
export function resolveFrameLabels({ takenAt, eventName } = {}) {
  const date = takenAt === undefined || takenAt === null || takenAt === ""
    ? new Date()
    : takenAt;
  const event = (typeof eventName === "string" ? eventName.trim() : "")
    .slice(0, MAX_EVENT_NAME_LENGTH)
    .trim();
  return {
    date: formatFrameDate(date),
    title: "Little Moments",
    event,
    hasEvent: event.length > 0,
  };
}

const FONT_STACKS = {
  archivoBlack: "'Archivo Black', 'Arial Black', Impact, sans-serif",
  dmMono: "'DM Mono', 'Courier New', monospace",
  playfairItalic: "italic 600 32px 'Playfair Display', Georgia, serif",
  playfair: "'Playfair Display', Georgia, serif",
  caveat: "'Caveat', 'Segoe Script', cursive",
  specialElite: "'Special Elite', 'Courier New', monospace",
  unifraktur: "'UnifrakturCook', 'Old English Text MT', Georgia, serif",
  imFellItalic: "italic 20px 'IM Fell English', Georgia, serif",
  rye: "'Rye', 'Bookman Old Style', Georgia, serif",
  orbitron: "'Orbitron', 'Arial Black', sans-serif",
  shareTechMono: "'Share Tech Mono', 'Courier New', monospace",
};

export function fontStack(name) {
  return FONT_STACKS[name] || "sans-serif";
}

/** fontset/family pairs awaiting `document.fonts.load` before a render. */
export const FRAME_FONT_SPECS = {
  pop: ["700 20px 'Archivo Black'", "400 16px 'DM Mono'"],
  film: ["italic 600 32px 'Playfair Display'", "400 14px 'DM Mono'"],
  scrapbook: ["700 40px 'Caveat'", "400 18px 'Special Elite'"],
  darkVictorian: ["700 40px 'UnifrakturCook'", "italic 20px 'IM Fell English'"],
  steampunk: ["700 32px 'Rye'", "400 18px 'Special Elite'"],
  cyberpunk: ["800 40px 'Orbitron'", "400 16px 'Share Tech Mono'"],
};

export function fontsForFrame(frameKey) {
  return FRAME_FONT_SPECS[frameKey] || [];
}

/**
 * Waits for every font a frame uses to be ready. Never rejects: a font that
 * fails to load falls back to the frame's fallback stack, and rendering must
 * not block forever on a missing font.
 */
export async function loadFrameFonts(frameKey) {
  const specs = fontsForFrame(frameKey);
  if (!specs.length) return;
  if (typeof document === "undefined" || !document.fonts?.load) return;
  await Promise.all(
    specs.map((spec) => Promise.resolve(document.fonts.load(spec)).catch(() => undefined)),
  );
}

/* ------------------------------------------------------------------ */
/* Offscreen cached backgrounds                                        */
/* ------------------------------------------------------------------ */

const backgroundCache = new Map();

export function getCachedBackground({ key, width, height, draw }) {
  const cacheKey = `${key}:${Math.round(width)}x${Math.round(height)}`;
  const cached = backgroundCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering context is unavailable.");
  draw(context, canvas.width, canvas.height);
  backgroundCache.set(cacheKey, canvas);
  return canvas;
}

export function clearBackgroundCache() {
  backgroundCache.clear();
}

/** Deterministic pseudo-random in [0, 1) so ornaments never jitter between renders. */
export function seededNoise(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Draws a small "sparkle" (four-point star) at x/y with radius r.
 */
export function drawSparkle(context, x, y, r, color) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y - r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.quadraticCurveTo(x, y, x, y + r);
  context.quadraticCurveTo(x, y, x - r, y);
  context.quadraticCurveTo(x, y, x, y - r);
  context.closePath();
  context.fill();
  context.restore();
}

/**
 * Draws text with a hard offset shadow (no blur), used by the Pop family.
 */
export function fillTextOffset(context, text, x, y, offset, shadowColor) {
  context.save();
  context.fillStyle = shadowColor;
  context.fillText(text, x + offset, y + offset);
  context.fillStyle = shadowColor === context.fillStyle ? context.fillStyle : context.fillStyle;
  context.restore();
}

/**
 * Draws a pill with an outlined border around a label, centered at x/y.
 * Returns the measured width so callers can lay out adjacent content.
 */
export function drawOutlinedPill(
  context,
  text,
  { x, y, font, textColor, borderColor, fillColor = "transparent", padX = 14, padY = 9, radius = 999 },
) {
  context.save();
  context.font = font;
  const width = context.measureText(text).width + padX * 2;
  const height = padY * 2 + 16;
  context.beginPath();
  const r = Math.min(radius, height / 2);
  context.moveTo(x - width / 2 + r, y - height / 2);
  context.arcTo(x + width / 2, y - height / 2, x + width / 2, y + height / 2, r);
  context.arcTo(x + width / 2, y + height / 2, x - width / 2, y + height / 2, r);
  context.arcTo(x - width / 2, y + height / 2, x - width / 2, y - height / 2, r);
  context.arcTo(x - width / 2, y - height / 2, x + width / 2, y - height / 2, r);
  context.closePath();
  if (fillColor !== "transparent") {
    context.fillStyle = fillColor;
    context.fill();
  }
  if (borderColor) {
    context.lineWidth = 2;
    context.strokeStyle = borderColor;
    context.stroke();
  }
  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x, y + 1);
  context.restore();
  return width;
}

/**
 * Common frame render entry: creates the placeholder participant list so a
 * frame renders identically with or without photos (used by picker thumbs).
 */
export function normalizeParticipants(participants) {
  return Array.from({ length: 4 }, (_, index) => participants[index] || null);
}
