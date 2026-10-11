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

  it("returns an empty group canvas when no participant has a video", () => {
    const canvas = composeGroupShot([{ label: "No camera" }, null]);

    expect(canvas.width).toBe(GROUP_SHOT_WIDTH);
    expect(canvas.height).toBe(GROUP_SHOT_HEIGHT);
    expect(context.drawImage).not.toHaveBeenCalled();
  });
});
