import {
  GROUP_SHOT_HEIGHT,
  GROUP_SHOT_WIDTH,
  composeGroupShot,
} from "../canvas.js";

function createContext() {
  return {
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
  };
}

describe("composeGroupShot", () => {
  let context;

  beforeEach(() => {
    context = createContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tiles every participant into a single 4:3 group canvas", () => {
    const canvas = composeGroupShot([
      { video: { width: 320, height: 240 }, label: "A" },
      { video: { width: 320, height: 240 }, label: "B" },
    ]);

    expect(canvas.width).toBe(GROUP_SHOT_WIDTH);
    expect(canvas.height).toBe(GROUP_SHOT_HEIGHT);
    expect(context.fillRect).toHaveBeenCalledTimes(1);
    expect(context.drawImage).toHaveBeenCalledTimes(2);
  });

  it("keeps one tile per participant for larger groups", () => {
    const participants = Array.from({ length: 5 }, () => ({
      video: { width: 320, height: 240 },
    }));

    composeGroupShot(participants);

    expect(context.drawImage).toHaveBeenCalledTimes(5);
  });

  it("lays three participants out as equal portrait tiles with vertical margins", () => {
    composeGroupShot([
      { video: { width: 320, height: 240 }, label: "A" },
      { video: { width: 320, height: 240 }, label: "B" },
      { video: { width: 320, height: 240 }, label: "C" },
    ]);

    expect(context.drawImage).toHaveBeenCalledTimes(3);

    // Each tile is one third of the canvas wide and a shorter portrait strip,
    // so the canvas keeps a margin above and below the row.
    for (const call of context.drawImage.mock.calls) {
      expect(call[7]).toBeCloseTo(GROUP_SHOT_WIDTH / 3, 6);
      expect(call[8]).toBeGreaterThan(0);
      expect(call[8]).toBeLessThan(GROUP_SHOT_HEIGHT);
    }

    // Mirrored tiles translate to (tileX + tileWidth, tileY): three across,
    // each sharing the canvas's vertical centre.
    const expectedX = [GROUP_SHOT_WIDTH / 3, (GROUP_SHOT_WIDTH * 2) / 3, GROUP_SHOT_WIDTH];
    context.translate.mock.calls.forEach(([x, y], index) => {
      expect(x).toBeCloseTo(expectedX[index], 6);
      const destHeight = context.drawImage.mock.calls[index][8];
      expect(y + destHeight / 2).toBeCloseTo(GROUP_SHOT_HEIGHT / 2, 6);
    });
  });

  it("returns an empty group canvas when no participant has a video", () => {
    const canvas = composeGroupShot([{ label: "No camera" }, null]);

    expect(canvas.width).toBe(GROUP_SHOT_WIDTH);
    expect(canvas.height).toBe(GROUP_SHOT_HEIGHT);
    expect(context.drawImage).not.toHaveBeenCalled();
  });
});
