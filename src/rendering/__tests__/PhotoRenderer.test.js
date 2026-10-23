import { renderPhoto } from "../PhotoRenderer.js";

function createContext() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fill: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    clip: vi.fn(),
  };
}

describe("renderPhoto burst composition", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(createContext);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,composite");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["single-horizontal", 1280, 360],
    ["single-vertical", 340, 1090],
    ["grid-2x2", 720, 696],
  ])("renders all four burst captures using the %s layout", (layout, width, height) => {
    const shots = Array.from({ length: 4 }, (_, index) => [{
      video: { width: 320, height: 240, shot: index + 1 },
      label: "Group",
    }]);
    const canvas = {
      width: 0,
      height: 0,
      toDataURL: vi.fn(() => "data:image/png;base64,composite"),
    };
    const context = createContext();

    renderPhoto({ canvas, context, participants: [], burstShots: shots, frame: "none", layout });

    // Every frame is drawn once on its own fixed design-unit canvas; each of
    // the four cells receives one composed group shot from its burst moment.
    expect(canvas).toMatchObject({ width, height });
    expect(context.drawImage).toHaveBeenCalledTimes(4);
    expect(new Set(context.drawImage.mock.calls.map(([shotCanvas]) => shotCanvas)).size).toBe(4);
  });

  it("releases every composed group-shot canvas once the photo is encoded", () => {
    const shots = Array.from({ length: 4 }, (_, index) => [{
      video: { width: 320, height: 240, shot: index + 1 },
      label: "Group",
    }]);
    const canvas = {
      width: 0,
      height: 0,
      toDataURL: vi.fn(() => "data:image/png;base64,composite"),
    };
    const context = createContext();

    renderPhoto({ canvas, context, participants: [], burstShots: shots, frame: "none", layout: "grid-2x2" });

    const groupShots = context.drawImage.mock.calls.map(([groupShot]) => groupShot);
    expect(groupShots).toHaveLength(4);
    for (const groupShot of groupShots) {
      expect(groupShot).toMatchObject({ width: 0, height: 0 });
    }
  });

  it("uses the horizontal design units for an unsupported layout key", () => {
    const shots = Array.from({ length: 4 }, (_, index) => [{
      video: { width: 320, height: 240, shot: index + 1 },
      label: "Group",
    }]);
    const canvas = { width: 0, height: 0, toDataURL: vi.fn(() => "composite") };
    const context = createContext();

    renderPhoto({
      canvas,
      context,
      participants: [],
      burstShots: shots,
      frame: "none",
      layout: "unsupported",
    });

    expect(canvas).toMatchObject({ width: 1280, height: 360 });
    expect(context.drawImage).toHaveBeenCalledTimes(4);
  });

  it("rejects fewer than four captured shots", () => {
    const shots = Array.from({ length: 3 }, () => []);
    const canvas = { width: 0, height: 0, toDataURL: vi.fn() };

    expect(() =>
      renderPhoto({
        canvas,
        context: createContext(),
        participants: [],
        burstShots: shots,
        frame: "none",
        layout: "grid-2x2",
      }),
    ).toThrow("Exactly four burst shots are required to compose a photo.");
  });
});

describe("renderPhoto non-burst layouts", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(createContext);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,composite");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderStandalone(layout) {
    const canvas = {
      width: 0,
      height: 0,
      toDataURL: vi.fn(() => "data:image/png;base64,composite"),
    };
    const context = createContext();

    renderPhoto({ canvas, context, participants: [], frame: "none", layout });

    return { canvas, context };
  }

  it("aspect-fits a single-vertical render instead of stretching it", () => {
    const { canvas, context } = renderStandalone("single-vertical");

    expect(canvas).toMatchObject({ width: 340, height: 1090 });
    expect(context.drawImage).toHaveBeenCalledTimes(1);

    // The 340x1090 base is width-limited to 0.72 and centred vertically
    // inside the 244.8x1034 inset box.
    const [, x, y, width, height] = context.drawImage.mock.calls[0];
    expect(width).toBeCloseTo(244.8);
    expect(height).toBeCloseTo(784.8);
    expect(x).toBeCloseTo(47.6);
    expect(y).toBeCloseTo(152.6);
  });

  it("aspect-fits a single-horizontal render instead of stretching it", () => {
    const { canvas, context } = renderStandalone("single-horizontal");

    expect(canvas).toMatchObject({ width: 1280, height: 360 });
    expect(context.drawImage).toHaveBeenCalledTimes(1);

    // The 1280x360 base is height-limited to 0.8 and centred horizontally
    // inside the 1216x288 inset box.
    const [, x, y, width, height] = context.drawImage.mock.calls[0];
    expect(width).toBeCloseTo(1024);
    expect(height).toBeCloseTo(288);
    expect(x).toBeCloseTo(128);
    expect(y).toBeCloseTo(36);
  });

  it("spaces the grid-2x2 tiles with equal margins and gaps", () => {
    const { canvas, context } = renderStandalone("grid-2x2");

    expect(canvas).toMatchObject({ width: 720, height: 696 });
    expect(context.drawImage).toHaveBeenCalledTimes(4);

    // Canvas 720x696 with a 28px inset and a 16px gap gives 324x312 tiles.
    // Each 720x696 base is height-limited to 312, so it fills the tile
    // vertically and is centred horizontally, making every drawn image's
    // centre the centre of its tile.
    const inset = 28;
    const gap = 16;
    const tileWidth = 324;
    const tileHeight = 312;
    const centres = context.drawImage.mock.calls.map(([, x, y, width, height]) => [
      x + width / 2,
      y + height / 2,
    ]);

    context.drawImage.mock.calls.forEach(([, , , width, height]) => {
      expect(width).toBeCloseTo((720 * tileHeight) / 696);
      expect(height).toBeCloseTo(tileHeight);
    });

    centres.forEach(([x, y], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      expect(x).toBeCloseTo(inset + tileWidth / 2 + column * (tileWidth + gap));
      expect(y).toBeCloseTo(inset + tileHeight / 2 + row * (tileHeight + gap));
    });

    expect(centres[0][0] - tileWidth / 2).toBeCloseTo(inset);
    expect(720 - (centres[1][0] + tileWidth / 2)).toBeCloseTo(inset);
    expect(centres[0][1] - tileHeight / 2).toBeCloseTo(inset);
    expect(696 - (centres[3][1] + tileHeight / 2)).toBeCloseTo(inset);
  });
});