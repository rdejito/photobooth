import { computeTileBoxes, stageColumns } from "../cameraTileLayout.js";

describe("stageColumns", () => {
  it("uses one column alone and two per row for groups", () => {
    expect(stageColumns(0)).toBe(1);
    expect(stageColumns(1)).toBe(1);
    expect(stageColumns(2)).toBe(2);
    expect(stageColumns(3)).toBe(2);
    expect(stageColumns(4)).toBe(2);
  });
});

describe("computeTileBoxes", () => {
  it("returns one box per camera with an empty input for no participants", () => {
    expect(computeTileBoxes({ ratios: [] })).toEqual([]);
  });

  it("shares one tile height so a mixed-detail row lines up", () => {
    // A portrait phone (9:16) beside a wide desktop (16:9).
    const [phone, desktop] = computeTileBoxes({
      ratios: [9 / 16, 16 / 9],
      containerWidth: 800,
      containerHeight: 400,
      columns: 2,
      gapX: 24,
    });

    expect(phone.height).toBeCloseTo(desktop.height, 6);
    // Each tile keeps its own camera ratio: no distortion.
    expect(phone.width / phone.height).toBeCloseTo(9 / 16, 6);
    expect(desktop.width / desktop.height).toBeCloseTo(16 / 9, 6);
  });

  it("keeps every box inside the container width and height", () => {
    const boxes = computeTileBoxes({
      ratios: [16 / 9, 9 / 16, 4 / 3, 1],
      containerWidth: 1000,
      containerHeight: 640,
      columns: 2,
      gapX: 24,
      gapY: 24,
    });

    const widthRow1 = boxes[0].width + boxes[1].width + 24;
    const widthRow2 = boxes[2].width + boxes[3].width + 24;
    const totalHeight = boxes[0].height + boxes[2].height + 24;

    expect(widthRow1).toBeLessThanOrEqual(1000.0001);
    expect(widthRow2).toBeLessThanOrEqual(1000.0001);
    expect(totalHeight).toBeLessThanOrEqual(640.0001);
    // Every tile shares the same height, so rows look even.
    expect(new Set(boxes.map((box) => box.height)).size).toBe(1);
  });

  it("limits wide groups by their widest row", () => {
    const boxes = computeTileBoxes({
      ratios: [16 / 9, 16 / 9],
      containerWidth: 960,
      containerHeight: 1000,
      columns: 2,
      gapX: 32,
    });

    expect(boxes[0].width).toBeCloseTo((960 - 32) / 2, 6);
    expect(boxes[0].height).toBeCloseTo(boxes[0].width / (16 / 9), 6);
  });

  it("handles a lone participant and gaps", () => {
    const [tile] = computeTileBoxes({
      ratios: [4 / 3],
      containerWidth: 640,
      containerHeight: 480,
      columns: 1,
    });

    expect(tile.width).toBeCloseTo(640, 6);
    expect(tile.height).toBeCloseTo(480, 6);
  });
});
