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
    arcTo: vi.fn(),
    closePath: vi.fn(),
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