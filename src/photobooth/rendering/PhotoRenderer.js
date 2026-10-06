import { renderArcade } from "./frames/arcade.js";
import { renderClassic } from "./frames/classic.js";
import { renderFilm } from "./frames/film.js";
import { renderNone } from "./frames/none.js";
import { renderPolaroid } from "./frames/polaroid.js";

const FRAME_RENDERERS = {
  classic: renderClassic,
  arcade: renderArcade,
  polaroid: renderPolaroid,
  film: renderFilm,
  none: renderNone,
};

export function renderPhoto({ canvas, context, participants, frame }) {
  const renderer = FRAME_RENDERERS[frame] || renderNone;
  renderer(canvas, context, participants);
  return canvas.toDataURL("image/png");
}
