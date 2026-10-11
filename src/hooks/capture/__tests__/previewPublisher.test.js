import { buildPhotoMessage, publishPhotoMessage } from "../previewPublisher.js";

describe("buildPhotoMessage", () => {
  it("builds a unique captureId-revision id and defaults to a saved photo", () => {
    const message = buildPhotoMessage({
      captureId: "cap",
      revision: 2,
      dataUrl: "data:image/png;base64,x",
      frame: "classic",
      layout: "single-horizontal",
    });

    expect(message).toEqual({
      id: "cap-2",
      captureId: "cap",
      revision: 2,
      preview: false,
      dataUrl: "data:image/png;base64,x",
      frame: "classic",
      layout: "single-horizontal",
      eventName: "",
    });
  });

  it("keeps preview true, the event name and a per-revision id", () => {
    const message = buildPhotoMessage({
      captureId: "cap",
      revision: 0,
      preview: true,
      dataUrl: "data:image/png;base64,y",
      frame: "polaroid",
      layout: "grid-2x2",
      eventName: "Emma",
    });

    expect(message.id).toBe("cap-0");
    expect(message.preview).toBe(true);
    expect(message.eventName).toBe("Emma");
  });
});

describe("publishPhotoMessage", () => {
  it("broadcasts the built message and returns the same object", () => {
    const broadcast = vi.fn();

    const message = publishPhotoMessage(broadcast, {
      captureId: "cap",
      revision: 1,
      preview: true,
      dataUrl: "data:image/png;base64,z",
      frame: "film",
      layout: "single-vertical",
    });

    expect(broadcast).toHaveBeenCalledWith(message);
    expect(message.id).toBe("cap-1");
    expect(message.revision).toBe(1);
  });
});
