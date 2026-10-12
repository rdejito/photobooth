import { useLayoutEffect } from "react";
import { chooseColumns, computeTileBoxes } from "../lib/cameraTileLayout.js";

/** Reads a tile's camera aspect ratio from its computed `aspect-ratio`. */
function readAspectRatio(element) {
  const [width, height] = getComputedStyle(element)
    .aspectRatio.split("/")
    .map(Number);
  return width > 0 && height > 0 ? width / height : 4 / 3;
}

/** Writes a style property only when it changes (keeps observers from looping). */
function setStyle(element, property, value) {
  if (element.style[property] !== value) element.style[property] = value;
}

/**
 * Sizes the live camera tiles to the stage. Mixed-device rooms share one tile
 * height across the grid so rows line up, while each tile keeps its own camera
 * ratio (see `computeTileBoxes`), so different streams are never distorted.
 *
 * The arrangement is re-chosen from the stage's live shape: `chooseColumns`
 * lets two landscape cameras stack on a portrait phone and four portrait
 * cameras run across a wide desktop, so the tiles fill the stage instead of
 * leaving letterbox bands. The group wraps each row itself, so the tiles only
 * need whole-pixel widths and a shared height. A `ResizeObserver` covers
 * container changes, and window `resize`/`orientationchange` events cover
 * viewport and rotation changes that don't always surface as a container
 * resize.
 */
export function useCameraTileSizing(groupRef, participantCount) {
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || !participantCount) return undefined;

    const sizeTiles = () => {
      const tiles = Array.from(group.children);
      if (!tiles.length) return;

      const styles = getComputedStyle(group);
      const gapX = parseFloat(styles.columnGap) || 0;
      const gapY = parseFloat(styles.rowGap) || 0;
      const containerWidth = group.clientWidth;
      const containerHeight = group.clientHeight;
      const ratios = tiles.map(readAspectRatio);
      const boxes = computeTileBoxes({
        ratios,
        containerWidth,
        containerHeight,
        columns: chooseColumns({
          ratios,
          containerWidth,
          containerHeight,
          gapX,
          gapY,
        }),
        gapX,
        gapY,
      });

      tiles.forEach((tile, index) => {
        const box = boxes[index];
        if (!box) return;
        // Whole-pixel sizes keep a full row from wrapping on a rounding error.
        setStyle(tile, "width", `${Math.floor(box.width)}px`);
        setStyle(tile, "height", `${Math.floor(box.height)}px`);
      });
    };

    const resizeObserver = new ResizeObserver(sizeTiles);
    const metadataObserver = new MutationObserver(sizeTiles);
    resizeObserver.observe(group);
    metadataObserver.observe(group, {
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
    window.addEventListener("resize", sizeTiles);
    window.addEventListener("orientationchange", sizeTiles);
    sizeTiles();
    return () => {
      resizeObserver.disconnect();
      metadataObserver.disconnect();
      window.removeEventListener("resize", sizeTiles);
      window.removeEventListener("orientationchange", sizeTiles);
    };
  }, [groupRef, participantCount]);
}
