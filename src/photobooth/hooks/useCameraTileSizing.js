import { useLayoutEffect } from "react";

function readAspectRatio(element) {
  const [width, height] = getComputedStyle(element)
    .aspectRatio.split("/")
    .map(Number);
  return width > 0 && height > 0 ? width / height : 4 / 3;
}

export function useCameraTileSizing(groupRef, participantCount) {
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || !participantCount) return undefined;

    const sizeTiles = () => {
      const columns = participantCount === 1
        ? 1
        : participantCount === 2
          ? 2
          : 2;
      const rows = Math.ceil(participantCount / columns);
      const styles = getComputedStyle(group);
      const gapX = parseFloat(styles.columnGap) || 0;
      const gapY = parseFloat(styles.rowGap) || 0;
      const cellWidth = (group.clientWidth - gapX * (columns - 1)) / columns;
      const cellHeight = (group.clientHeight - gapY * (rows - 1)) / rows;

      Array.from(group.children).forEach((tile) => {
        const ratio = readAspectRatio(tile);
        const width = Math.min(cellWidth, cellHeight * ratio);
        const height = width / ratio;
        const currentWidth = parseFloat(tile.style.width);
        const currentHeight = parseFloat(tile.style.height);
        if (!Number.isFinite(currentWidth) || Math.abs(currentWidth - width) > 0.5) {
          tile.style.width = `${width}px`;
        }
        if (!Number.isFinite(currentHeight) || Math.abs(currentHeight - height) > 0.5) {
          tile.style.height = `${height}px`;
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
