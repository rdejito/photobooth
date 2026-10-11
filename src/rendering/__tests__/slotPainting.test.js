import {
  drawSlotCanvas,
  drawSlotPhoto,
  drawSlotPlaceholder,
} from "../frames/units/slotPainting.js";

function createContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    clip: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
  };
}

const slot = { x: 0, y: 0, width: 200, height: 150 };

describe("slotPainting", () => {
  let context;

  beforeEach(() => {
    context = createContext();
  });

  it("draws a pre-composed canvas into the inner slot with its border", () => {
    const canvas = { width: 400, height: 300 };

    drawSlotCanvas(context, slot, canvas, { borderColor: "#123456", borderWidth: 5 });

    // Border: a full-slot fillRect under the photo.
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
    // Photo: cover-cropped into the border-inset box, never mirrored.
    expect(context.drawImage).toHaveBeenCalledWith(
      canvas,
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      5,
      5,
      190,
      140,
    );
    // Not mirrored: no translate/scale flip for pre-composed cells.
    expect(context.translate).not.toHaveBeenCalled();
    expect(context.scale).not.toHaveBeenCalled();
  });

  it("mirrors a live participant video into its slot", () => {
    const participant = { video: { videoWidth: 640, videoHeight: 480, readyState: 4 }, label: "A" };
    const drawn = context.drawImage.mock.calls.length;

    drawSlotPhoto(context, slot, participant, { borderWidth: 10 });

    expect(context.drawImage).toHaveBeenCalledTimes(drawn + 1);
    // Mirrored path flips the drawing space around the inner box's right edge.
    expect(context.translate).toHaveBeenCalledWith(190, 10);
    expect(context.scale).toHaveBeenCalledWith(-1, 1);
  });

  it("draws a labeled placeholder when a slot has no video", () => {
    drawSlotPlaceholder(context, {
      x: 0,
      y: 0,
      width: 200,
      height: 150,
      fill: "#d7d9de",
      ink: "#8a909b",
      labelColor: "#6c7280",
      labelFont: "700 20px monospace",
      label: "PHOTO 1",
    });

    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
    expect(context.fillText).toHaveBeenCalledWith(
      "PHOTO 1",
      expect.any(Number),
      expect.any(Number),
    );
  });

  it("routes canvas content to drawSlotCanvas and videos to participant drawing", () => {
    const photo = { x: 0, y: 0, width: 200, height: 150 };
    const canvasContent = { width: 100, height: 100, getContext: () => createContext() };
    const participant = { video: readyVideoLike(), label: "B" };

    drawSlotPhoto(context, photo, canvasContent, { borderWidth: 0 });
    expect(context.drawImage).toHaveBeenCalled();

    context.drawImage.mockClear();
    drawSlotPhoto(context, photo, participant, { borderWidth: 0 });
    // Participant path mirrors (translate + scale) before drawing its video.
    expect(context.scale).toHaveBeenCalledWith(-1, 1);
  });

  function readyVideoLike() {
    return { videoWidth: 320, videoHeight: 240, readyState: 4 };
  }
});