import { useLayoutEffect } from "react";
import { computeTileBoxes, stageColumns } from "../lib/cameraTileLayout.js";

/** Reads a tile's camera aspect ratio from its computed `aspect-ratio`. */
function readAspectRatio(element) {
  const [width, height] = getComputedStyle(element)
    .aspectRatio.split("/")
    .map(Number);
  return width > 0 && height > 0 ? width / height : 4 / 3;
}

/**
 * Sizes the live camera tiles to the stage. Mixed-device rooms share one tile
 * height across the grid so rows line up, while each tile keeps its own camera
 * ratio (see `computeTileBoxes`), so different streams are never distorted.
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
      const boxes = computeTileBoxes({
        ratios: tiles.map(readAspectRatio),
        containerWidth: group.clientWidth,
        containerHeight: group.clientHeight,
        columns: stageColumns(participantCount),
        gapX,
        gapY,
      });

      tiles.forEach((tile, index) => {
        const box = boxes[index];
        if (!box) return;
        const currentWidth = parseFloat(tile.style.width);
        const currentHeight = parseFloat(tile.style.height);
        if (!Number.isFinite(currentWidth) || Math.abs(currentWidth - box.width) > 0.5) {
          tile.style.width = `${box.width}px`;
        }
        if (!Number.isFinite(currentHeight) || Math.abs(currentHeight - box.height) > 0.5) {
          tile.style.height = `${box.height}px`;
        }
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
    sizeTiles();
    return () => {
      resizeObserver.disconnect();
      metadataObserver.disconnect();
    };
  }, [groupRef, participantCount]);
}
