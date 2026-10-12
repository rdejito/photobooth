import {
  GROUP_SHOT_HEIGHT,
  GROUP_SHOT_WIDTH,
  composeGroupShot,
} from "../canvas.js";
import { GROUP_TILE_FOCUS } from "../cropGuide.js";

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

  it("frames a tall phone into a wide tile without cutting off the head", () => {
    const phone = { video: { videoWidth: 405, videoHeight: 720 }, label: "Phone" };
    const desktop = { video: { videoWidth: 1280, videoHeight: 720 }, label: "Desktop" };

    composeGroupShot([
      phone,
      desktop,
      { video: { videoWidth: 405, videoHeight: 720 }, label: "Phone 2" },
      { video: { videoWidth: 1280, videoHeight: 720 }, label: "Desktop 2" },
    ]);

    const tileWidth = GROUP_SHOT_WIDTH / 2;
    const tileHeight = GROUP_SHOT_HEIGHT / 2;
    const [phoneCall, desktopCall] = context.drawImage.mock.calls;

    // Every tile is drawn at its grid size, no stretching, and cover-cropped to
    // that tile's aspect ratio.
    for (const call of context.drawImage.mock.calls) {
      expect(call[7]).toBeCloseTo(tileWidth, 6);
      expect(call[8]).toBeCloseTo(tileHeight, 6);
      expect(call[3] / call[4]).toBeCloseTo(tileWidth / tileHeight, 6);
    }

    // Tall phone: full width kept, bottom trimmed, and the crop anchored above
    // centre so the head stays in frame.
    const [, , phoneSourceY, phoneSourceW, phoneSourceH] = phoneCall;
    const centredY = (720 - phoneSourceH) / 2;
    expect(phoneSourceW).toBeCloseTo(405, 6);
    expect(phoneSourceH).toBeLessThan(720);
    expect(phoneSourceY).toBeLessThan(centredY);
    expect(phoneSourceY).toBeCloseTo((720 - phoneSourceH) * GROUP_TILE_FOCUS.y, 6);

    // Wide desktop: keeps its full height and trims the sides.
    const [, , desktopSourceY, desktopSourceW, desktopSourceH] = desktopCall;
    expect(desktopSourceY).toBe(0);
    expect(desktopSourceH).toBe(720);
    expect(desktopSourceW).toBeLessThan(1280);
  });

  it("returns an empty group canvas when no participant has a video", () => {
    const canvas = composeGroupShot([{ label: "No camera" }, null]);

    expect(canvas.width).toBe(GROUP_SHOT_WIDTH);
    expect(canvas.height).toBe(GROUP_SHOT_HEIGHT);
    expect(context.drawImage).not.toHaveBeenCalled();
  });
});
