import { useLayoutEffect } from "react";
import { chooseColumns, computeTileBoxes } from "../lib/cameraTileLayout.js";

/** Reads a tile's camera aspect ratio from its computed `aspect-ratio`. */
function readAspectRatio(element) {
  const [width, height] = getComputedStyle(element)
    .aspectRatio.split("/")
    .map(Number);
  return width > 0 && height > 0 ? width / height : 4 / 3;
}

/**
 * Resolves the optional `--tile-max-height` budget to pixels. Custom properties
 * come back as their token stream (`"52dvh"`), not a resolved length, so viewport
 * units are converted against the visual viewport here.
 */
function readHeightBudget(styles) {
  if (typeof styles.getPropertyValue !== "function") return 0;
  const raw = styles.getPropertyValue("--tile-max-height").trim();
  const value = parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (raw.endsWith("vh")) {
    const viewport = window.visualViewport?.height || window.innerHeight || 0;
    return (viewport * value) / 100;
  }
  return value;
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
 * leaving letterbox bands. The group is an equal-track grid with exactly that
 * many columns, so a row can never greedily fit an extra tile, while each tile
 * keeps its own computed width inside its centred track. A `ResizeObserver`
 * covers container changes, and window `resize`/`orientationchange` events
 * cover viewport and rotation changes that don't always surface as a container
 * resize.
 *
 * The optional `--tile-max-height` custom property sizes the tiles width-first
 * inside a height budget and lets the grid row collapse to the content height.
 * No shipped layout sets it now that the portrait stage takes the leftover
 * height itself; the budget remains for layouts that need a hard cap.
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
      const heightBudget = readHeightBudget(styles);
      const containerHeight = heightBudget || group.clientHeight;
      const ratios = tiles.map(readAspectRatio);
      const columns = chooseColumns({
        ratios,
        containerWidth,
        containerHeight,
        gapX,
        gapY,
      });
      const boxes = computeTileBoxes({
        ratios,
        containerWidth,
        containerHeight,
        columns,
        gapX,
        gapY,
      });
      // Equal tracks keep the rendered rows in step with the scored column
      // count; each tile's own width only ever fills part of its track.
      setStyle(group, "gridTemplateColumns", `repeat(${columns}, minmax(0, 1fr))`);

      // A partial final row holds one tile. Let it span the grid so it stays
      // centred like the full rows above it.
      const trailingTile =
        columns > 1 && tiles.length % columns === 1 ? tiles.length - 1 : -1;

      tiles.forEach((tile, index) => {
        const box = boxes[index];
        if (!box) return;
        // Whole-pixel sizes keep a full row from wrapping on a rounding error.
        setStyle(tile, "width", `${Math.floor(box.width)}px`);
        setStyle(tile, "height", `${Math.floor(box.height)}px`);
        setStyle(tile, "gridColumn", index === trailingTile ? "1 / -1" : "");
      });

      if (!heightBudget) {
        setStyle(group, "height", "");
        return;
      }
      // Budgeted (portrait) mode: the row must shrink back to the content the
      // tiles actually need instead of leaving centred dead space.
      const rows = Math.ceil(tiles.length / columns);
      const contentHeight = boxes[0]
        ? boxes[0].height * rows + gapY * (rows - 1)
        : 0;
      setStyle(group, "height", `${Math.floor(contentHeight)}px`);
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
