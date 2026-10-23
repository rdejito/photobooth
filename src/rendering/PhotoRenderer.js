import { renderArcade } from "./frames/arcade.js";
import { renderClassic } from "./frames/classic.js";
import { renderFilm } from "./frames/film.js";
import { renderNone } from "./frames/none.js";
import { renderPolaroid } from "./frames/polaroid.js";
import { renderPop, renderBlush, renderNoir, renderMint } from "./frames/pop/index.js";
import { renderScrapbook } from "./frames/scrapbook/index.js";
import { renderDarkVictorian } from "./frames/darkVictorian.js";
import { renderSteampunk } from "./frames/steampunk.js";
import { renderCyberpunk } from "./frames/cyberpunk.js";
import { composeGroupShot } from "./canvas.js";
import { FRAME_IDS, PHOTO_SHOT_COUNT } from "../lib/constants.js";

/**
 * Frame registry: frame id -> renderer. Each renderer receives
 * (canvas, context, participants, options) and sets its own canvas size. Every
 * frame is authored in fixed design units (see units.js) and owns its four
 * photo slots per layout, so the burst pipeline hands it one composed group
 * shot per slot and it is drawn exactly once.
 */
export const FRAME_RENDERERS = {
  classic: renderClassic,
  arcade: renderArcade,
  polaroid: renderPolaroid,
  film: renderFilm,
  none: renderNone,
  pop: renderPop,
  blush: renderBlush,
  noir: renderNoir,
  mint: renderMint,
  scrapbook: renderScrapbook,
  darkVictorian: renderDarkVictorian,
  steampunk: renderSteampunk,
  cyberpunk: renderCyberpunk,
};

export function getFrameRenderer(frameKey) {
  return FRAME_RENDERERS[frameKey] || renderNone;
}

/**
 * Draws `source` inside `box` at its native aspect ratio, centred, so a layout
 * never stretches the rendered frame to fill a differently-shaped target.
 */
function drawAspectFit(context, source, box) {
  const scale = Math.min(box.width / source.width, box.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;

  context.drawImage(
    source,
    box.x + (box.width - width) / 2,
    box.y + (box.height - height) / 2,
    width,
    height,
  );
}

function drawLayout({ context, canvas, baseCanvas, layout }) {
  const defaultInset = 28;
  const width = canvas.width;
  const height = canvas.height;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#171423";
  context.fillRect(0, 0, width, height);

  if (layout === "single-vertical") {
    const innerWidth = Math.min(width - defaultInset * 2, width * 0.72);
    const innerHeight = height - defaultInset * 2;
    drawAspectFit(context, baseCanvas, {
      x: (width - innerWidth) / 2,
      y: (height - innerHeight) / 2,
      width: innerWidth,
      height: innerHeight,
    });
    return;
  }

  if (layout === "grid-2x2") {
    const gap = 16;
    const tileWidth = (width - defaultInset * 2 - gap) / 2;
    const tileHeight = (height - defaultInset * 2 - gap) / 2;
    const positions = [
      [defaultInset, defaultInset],
      [defaultInset + tileWidth + gap, defaultInset],
      [defaultInset, defaultInset + tileHeight + gap],
      [defaultInset + tileWidth + gap, defaultInset + tileHeight + gap],
    ];

    positions.forEach(([x, y]) => {
      drawAspectFit(context, baseCanvas, {
        x,
        y,
        width: tileWidth,
        height: tileHeight,
      });
    });
    return;
  }

  const horizontalInset = 32;
  const horizontalHeight = Math.min(height - horizontalInset * 2, height * 0.8);
  drawAspectFit(context, baseCanvas, {
    x: horizontalInset,
    y: (height - horizontalHeight) / 2,
    width: width - horizontalInset * 2,
    height: horizontalHeight,
  });
}

const JPEG_FRAMES = new Set(FRAME_IDS);

/** Drops a canvas's backing store so a large composed image can be reclaimed. */
function releaseCanvas(canvas) {
  canvas.width = 0;
  canvas.height = 0;
}

function encodeCanvas(canvas, frameKey) {
  // The frames ship large, dense artwork; JPEG keeps them inside
  // PhotoTransfer's 4 MB limit and the localStorage gallery budget.
  if (JPEG_FRAMES.has(frameKey)) return canvas.toDataURL("image/jpeg", 0.88);
  return canvas.toDataURL("image/png");
}

export function renderPhoto({
  canvas,
  context,
  participants = [],
  burstShots,
  frame,
  layout = "single-horizontal",
  frameOptions = {},
}) {
  const renderer = getFrameRenderer(frame);
  const options = { ...frameOptions, layout };

  if (burstShots) {
    if (burstShots.length !== PHOTO_SHOT_COUNT) {
      throw new Error("Exactly four burst shots are required to compose a photo.");
    }
    // Every frame owns its four cells, so each cell receives one composed group
    // shot of every participant from that moment (the frame is drawn once).
    const groupShots = burstShots.map((shotParticipants) =>
      composeGroupShot(shotParticipants),
    );
    try {
      renderer(canvas, context, [], { ...options, groupShots });
      return encodeCanvas(canvas, frame);
    } finally {
      groupShots.forEach(releaseCanvas);
    }
  }

  const baseCanvas = document.createElement("canvas");
  const baseContext = baseCanvas.getContext("2d");
  if (!baseContext) {
    throw new Error("Canvas rendering context is unavailable.");
  }

  renderer(baseCanvas, baseContext, participants, options);
  canvas.width = baseCanvas.width;
  canvas.height = baseCanvas.height;
  drawLayout({ context, canvas, baseCanvas, layout });
  return encodeCanvas(canvas, frame);
}