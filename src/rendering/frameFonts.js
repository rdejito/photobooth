/**
 * Self-hosted frame fonts. Imported for their side effect so Vite bundles the
 * woff2 files, then awaited via `document.fonts.load` before a themed frame is
 * rendered (see `loadFrameFonts`). Rendering never silently falls back: if a
 * font fails to load, the renderer uses its documented fallback stack.
 */
import "@fontsource/archivo-black/400.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource/playfair-display/600-italic.css";
import "@fontsource/caveat/700.css";
import "@fontsource/special-elite/400.css";
import "@fontsource/unifrakturcook/700.css";
import "@fontsource/im-fell-english/400-italic.css";
import "@fontsource/rye/400.css";
import "@fontsource/orbitron/800.css";
import "@fontsource/share-tech-mono/400.css";

export {
  loadFrameFonts,
  fontsForFrame,
  FRAME_FONT_SPECS,
} from "./frames/shared.js";
