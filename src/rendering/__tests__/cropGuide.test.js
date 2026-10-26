import {
  GROUP_SHOT_HEIGHT,
  GROUP_SHOT_WIDTH,
  cameraCropRegion,
  coverSource,
  groupGridShape,
  groupTileFrames,
  groupTileSourceRect,
  slotSourceRect,
} from "../cropGuide.js";

describe("groupGridShape", () => {
  it("fills row-major across the supported group sizes", () => {
    expect(groupGridShape(1)).toEqual({ cols: 1, rows: 1 });
    expect(groupGridShape(2)).toEqual({ cols: 2, rows: 1 });
    expect(groupGridShape(3)).toEqual({ cols: 3, rows: 1 });
    expect(groupGridShape(4)).toEqual({ cols: 2, rows: 2 });
    expect(groupGridShape(5)).toEqual({ cols: 3, rows: 2 });
    expect(groupGridShape(7)).toEqual({ cols: 3, rows: 3 });
  });
});

describe("groupTileFrames", () => {
  it("lays a three-person group out as a row of portrait tiles with margins", () => {
    const frames = groupTileFrames(3);

    expect(frames.map((frame) => frame.x)).toEqual([0, 1 / 3, 2 / 3]);
    for (const frame of frames) {
      expect(frame.width).toBeCloseTo(1 / 3, 10);
      // Shorter than the canvas, so a margin remains above and below.
      expect(frame.height).toBeLessThan(1);
      // Each tile is centred vertically in the canvas.
      expect(frame.y).toBeCloseTo((1 - frame.height) / 2, 10);
      // 3:4 portrait once the canvas's 4:3 pixel aspect is applied.
      const pixelRatio =
        (frame.width * GROUP_SHOT_WIDTH) / (frame.height * GROUP_SHOT_HEIGHT);
      expect(pixelRatio).toBeCloseTo(3 / 4, 10);
    }
  });

  it("keeps the row-major grid for other group sizes", () => {
    expect(groupTileFrames(4)).toEqual([
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ]);
  });
});

describe("coverSource", () => {
  it("cover-fits a wide image into a portrait box, trimming the sides", () => {
    const source = coverSource(1280, 720, 320, 480);
    expect(source.height).toBe(720);
    expect(source.width).toBe(480);
    expect(source.x).toBe(400);
    expect(source.y).toBe(0);
  });
});

describe("groupTileSourceRect", () => {
  it("matches a tile's cover crop of the 4:3 group canvas", () => {
    const source = groupTileSourceRect(1280, 720, 2);
    expect(source.width).toBe(480);
    expect(source.x).toBe(400);
    expect(source.height).toBe(720);
  });
});

describe("slotSourceRect", () => {
  it("keeps the full group width for wide horizontal slots", () => {
    const source = slotSourceRect("single-horizontal");
    expect(source.x).toBe(0);
    expect(source.width).toBeCloseTo(GROUP_SHOT_WIDTH);
    expect(source.height).toBeLessThan(GROUP_SHOT_HEIGHT);
  });

  it("barely trims the square-ish 2x2 slot", () => {
    const source = slotSourceRect("grid-2x2");
    expect(source.width).toBeCloseTo(GROUP_SHOT_WIDTH);
    expect(source.height).toBeGreaterThan(GROUP_SHOT_HEIGHT - 1);
  });

  it("insets the source by the frame border, matching drawSlotCanvas", () => {
    const source = slotSourceRect("single-horizontal", 7);

    // Inner 272x186 slot: the group canvas still spans the full width, but
    // only 186/0.425 = 437.65 of its 480 rows survive (not the full-slot 447.55).
    expect(source.x).toBe(0);
    expect(source.width).toBeCloseTo(GROUP_SHOT_WIDTH);
    expect(source.height).toBeCloseTo(437.647, 2);
  });
});

describe("cameraCropRegion", () => {
  it("keeps the full camera width but trims the slot for a lone 4:3 camera", () => {
    const region = cameraCropRegion({
      videoWidth: 640,
      videoHeight: 480,
      participantCount: 1,
      participantIndex: 0,
      layout: "single-horizontal",
    });

    expect(region.x).toBeCloseTo(0);
    expect(region.width).toBeCloseTo(1);
    expect(region.y).toBeCloseTo(0.0338, 3);
    expect(region.height).toBeCloseTo(0.9324, 3);
  });

  it("accounts for the frame's border inset in the surviving region", () => {
    const region = cameraCropRegion({
      videoWidth: 640,
      videoHeight: 480,
      participantCount: 1,
      participantIndex: 0,
      layout: "single-horizontal",
      borderWidth: 7,
    });

    expect(region.y).toBeCloseTo(0.0441, 3);
    expect(region.height).toBeCloseTo(0.9118, 3);
  });

  it("trims the sides of a 16:9 camera shared by two people", () => {
    const region = cameraCropRegion({
      videoWidth: 1280,
      videoHeight: 720,
      participantCount: 2,
      participantIndex: 0,
      layout: "single-horizontal",
    });

    expect(region.x).toBeCloseTo(0.3125, 4);
    expect(region.width).toBeCloseTo(0.375, 4);
    expect(region.y).toBeCloseTo(0.0338, 3);
  });

  it("reflects the selected layout's slot crop", () => {
    const horizontal = cameraCropRegion({
      videoWidth: 1280,
      videoHeight: 720,
      participantCount: 2,
      layout: "single-horizontal",
    });
    const grid = cameraCropRegion({
      videoWidth: 1280,
      videoHeight: 720,
      participantCount: 2,
      layout: "grid-2x2",
    });

    expect(horizontal.height).toBeLessThan(grid.height);
  });

  it("crops the edge tile of a row more than the centre tile", () => {
    const top = cameraCropRegion({
      videoWidth: 640,
      videoHeight: 480,
      participantCount: 4,
      participantIndex: 0,
      layout: "single-horizontal",
    });
    const bottom = cameraCropRegion({
      videoWidth: 640,
      videoHeight: 480,
      participantCount: 4,
      participantIndex: 2,
      layout: "single-horizontal",
    });

    expect(top.y).toBeGreaterThan(0);
    expect(bottom.y).toBeCloseTo(0);
    expect(top.height).toBeCloseTo(bottom.height, 3);
  });

  it("clamps out-of-range participant indexes to a valid tile", () => {
    const region = cameraCropRegion({
      videoWidth: 1280,
      videoHeight: 720,
      participantCount: 2,
      participantIndex: 99,
      layout: "single-horizontal",
    });

    expect(region.width).toBeGreaterThan(0);
    expect(region.x).toBeGreaterThanOrEqual(0);
    expect(region.x + region.width).toBeLessThanOrEqual(1.0000001);
  });

  it("keeps the upper part of a tall camera cropped into a wide tile", () => {
    const region = cameraCropRegion({
      videoWidth: 405,
      videoHeight: 720,
      participantCount: 4,
      participantIndex: 0,
      layout: "single-horizontal",
    });

    // The head keeps the vertical crop above the tile centre.
    expect(region.y + region.height / 2).toBeLessThan(0.45);
    expect(region.x).toBeCloseTo(0);
    expect(region.width).toBeCloseTo(1);
    expect(region.y + region.height).toBeLessThanOrEqual(1.0000001);
  });

  it("keeps the full height of a wide camera in the same mixed group", () => {
    const region = cameraCropRegion({
      videoWidth: 1280,
      videoHeight: 720,
      participantCount: 4,
      participantIndex: 1,
      layout: "single-horizontal",
    });

    // No vertical crop on the group tile; only the slot's slight trim remains.
    expect(region.height).toBeGreaterThan(0.9);
    expect(region.width).toBeCloseTo(0.75, 3);
  });
});
