import { FRAMES } from "../../lib/constants.js";
import { FRAME_RENDERERS, renderPhoto } from "../PhotoRenderer.js";

const LAYOUTS = ["single-horizontal", "single-vertical", "grid-2x2"];

/**
 * Canvas stub covering every 2D API the frame renderers touch, including
 * Path2D-free paths, gradients, shadows and offscreen background caching.
 */
function createContext() {
  const gradient = { addColorStop: vi.fn() };
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 120 })),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "",
    textBaseline: "",
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    lineJoin: "",
    lineCap: "",
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
  };
}

function createCanvas() {
  return {
    width: 0,
    height: 0,
    getContext: createContext,
    toDataURL: vi.fn(() => "data:image/png;base64,frame"),
  };
}

describe("frame registry", () => {
  let contexts;

  beforeEach(() => {
    contexts = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      const context = createContext();
      contexts.push(context);
      return context;
    });
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,frame");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps every frame id in FRAMES to a renderer", () => {
    FRAMES.forEach(({ key }) => {
      expect(typeof FRAME_RENDERERS[key]).toBe("function");
    });
  });

  it("registers a renderer for every frame id", () => {
    const missing = FRAMES.filter(({ key }) => !FRAME_RENDERERS[key]);
    expect(missing).toEqual([]);
  });

  describe.each(FRAMES.map(({ key }) => key))("frame: %s", (frameKey) => {
    it.each(LAYOUTS)("renders the %s layout without throwing", (layout) => {
      const canvas = createCanvas();
      const context = createContext();

      expect(() =>
        renderPhoto({
          canvas,
          context,
          participants: [],
          frame: frameKey,
          layout,
          frameOptions: { eventName: "" },
        }),
      ).not.toThrow();

      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it.each(LAYOUTS)("renders the %s layout with photos", (layout) => {
      const canvas = createCanvas();
      const context = createContext();
      const participants = Array.from({ length: 4 }, (_, index) => ({
        video: { videoWidth: 320, videoHeight: 240, shot: index + 1 },
        label: `Guest ${index + 1}`,
      }));

      expect(() =>
        renderPhoto({
          canvas,
          context,
          participants,
          frame: frameKey,
          layout,
          frameOptions: { eventName: "Emma's birthday" },
        }),
      ).not.toThrow();
    });

    it("renders the no-photo placeholder case", () => {
      const canvas = createCanvas();
      const context = createContext();

      renderPhoto({
        canvas,
        context,
        participants: [],
        frame: frameKey,
        layout: "grid-2x2",
      });

      // Every frame draws "PHOTO n" labels on empty slots via fillText,
      // because all renderers share the design-unit slot pipeline.
      const drewLabel = contexts.some((ctx) =>
        ctx.fillText.mock.calls.some(([text]) => /PHOTO \d/.test(String(text))),
      );
      expect(drewLabel).toBe(true);
    });
  });

  it("falls back to the None renderer for an unknown frame id", () => {
    const canvas = createCanvas();
    const context = createContext();

    expect(() =>
      renderPhoto({ canvas, context, participants: [], frame: "does-not-exist" }),
    ).not.toThrow();
  });

  it("fills each slot with a composed group shot for layout frames in a burst", () => {
    const canvas = createCanvas();
    const context = createContext();
    const shots = Array.from({ length: 4 }, (_, index) => [
      { video: { videoWidth: 320, videoHeight: 240, shot: index + 1 }, label: "A" },
      { video: { videoWidth: 320, videoHeight: 240, shot: index + 1 }, label: "B" },
    ]);

    renderPhoto({
      canvas,
      context,
      participants: [],
      burstShots: shots,
      frame: "scrapbook",
      layout: "grid-2x2",
    });

    // One shared frame (its own design units) rather than four framed shots.
    expect(canvas.width).toBe(720);
    expect(canvas.height).toBe(696);

    // The cached background plus four distinct group-shot cell canvases.
    const sources = new Set(context.drawImage.mock.calls.map(([source]) => source));
    expect(sources.size).toBe(5);

    // With real content per slot the "PHOTO n" placeholders never render.
    const drewPlaceholder = context.fillText.mock.calls.some(([text]) =>
      /PHOTO \d/.test(String(text)),
    );
    expect(drewPlaceholder).toBe(false);
  });
});
