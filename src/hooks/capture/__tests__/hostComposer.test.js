const { composePhotoMock } = vi.hoisted(() => ({ composePhotoMock: vi.fn() }));
vi.mock("../photoComposer.js", () => ({ composePhoto: composePhotoMock }));

import {
  completeCapture,
  recomposePhoto,
  saveCapturedPhoto,
} from "../hostComposer.js";

beforeEach(() => {
  composePhotoMock.mockReset();
});

function makeSession(overrides = {}) {
  const session = {
    sequence: { clearTimers: vi.fn(), inProgress: true },
    canvasRef: { current: {} },
    broadcastPhoto: vi.fn(),
    frame: "classic",
    layout: "single-horizontal",
    eventNameRef: { current: "" },
    setCallStatus: vi.fn(),
    setCountdown: vi.fn(),
    setShotNumber: vi.fn(),
    broadcastCountdown: vi.fn(),
    abortCapture: vi.fn(),
    setPhotoPending: vi.fn(),
    setPhotoDataUrl: vi.fn(),
    setCanCustomizePreview: vi.fn(),
    setShowPreview: vi.fn(),
    setSelectedFrame: vi.fn(),
    setSelectedLayout: vi.fn(),
    addPhoto: vi.fn(() => ({ id: "photo-1" })),
    sourceParticipantsRef: { current: [] },
    sourceBurstParticipantsRef: { current: [] },
    captureIdRef: { current: null },
    photoRevisionRef: { current: 0 },
    photoSavedRef: { current: false },
    canCustomizePreview: true,
    photoDataUrl: "data:image/png;base64,composed",
    ...overrides,
  };
  return session;
}

describe("completeCapture", () => {
  it("broadcasts the composed burst as preview revision 0 and arms the host editor", async () => {
    composePhotoMock.mockResolvedValue({ dataUrl: "data:image/png;base64,composed" });
    const session = makeSession();

    await completeCapture(session, [["shot"]]);

    expect(composePhotoMock).toHaveBeenCalledOnce();
    expect(session.broadcastPhoto).toHaveBeenCalledOnce();
    const message = session.broadcastPhoto.mock.calls[0][0];
    expect(message).toMatchObject({
      revision: 0,
      preview: true,
      frame: "classic",
      layout: "single-horizontal",
      eventName: "",
    });
    expect(typeof message.captureId).toBe("string");
    expect(message.id).toBe(`${message.captureId}-0`);
    expect(session.photoRevisionRef.current).toBe(0);
    expect(session.photoSavedRef.current).toBe(false);
    expect(session.setShowPreview).toHaveBeenCalledWith(true);
    expect(session.setCanCustomizePreview).toHaveBeenCalledWith(true);
    expect(session.setPhotoPending).toHaveBeenCalledWith(false);
  });

  it("aborts cleanly and broadcasts nothing when the canvas is missing", async () => {
    composePhotoMock.mockResolvedValue({ error: "missing-canvas" });
    const session = makeSession();

    await completeCapture(session, []);

    expect(session.abortCapture).toHaveBeenCalledOnce();
    expect(session.broadcastPhoto).not.toHaveBeenCalled();
  });
});

describe("recomposePhoto", () => {
  it("broadcasts a new preview revision for each frame then layout change", async () => {
    composePhotoMock.mockResolvedValue({ dataUrl: "data:image/png;base64,rev" });
    const session = makeSession({
      sourceParticipantsRef: { current: [{ video: {}, label: "A" }] },
      captureIdRef: { current: "cap" },
    });
    session.setSelectedFrame = vi.fn((value) => { session.frame = value; });
    session.setSelectedLayout = vi.fn((value) => { session.layout = value; });

    await recomposePhoto(session, { nextFrame: "polaroid", logLabel: "x", failStatus: "y" });
    await recomposePhoto(session, { nextLayout: "grid-2x2", logLabel: "x", failStatus: "y" });

    expect(session.broadcastPhoto.mock.calls.map(([m]) => m.revision)).toEqual([1, 2]);
    expect(session.broadcastPhoto.mock.calls[0][0]).toMatchObject({
      preview: true,
      frame: "polaroid",
      layout: "single-horizontal",
    });
    expect(session.broadcastPhoto.mock.calls[1][0]).toMatchObject({
      preview: true,
      frame: "polaroid",
      layout: "grid-2x2",
    });
  });

  it("does nothing before the host can customize", async () => {
    const session = makeSession({ canCustomizePreview: false, photoDataUrl: "" });

    await recomposePhoto(session, { nextFrame: "polaroid", logLabel: "x", failStatus: "y" });

    expect(composePhotoMock).not.toHaveBeenCalled();
    expect(session.broadcastPhoto).not.toHaveBeenCalled();
  });
});

describe("saveCapturedPhoto", () => {
  it("saves locally and broadcasts the final non-preview revision exactly once", () => {
    const session = makeSession({
      captureIdRef: { current: "cap" },
      photoRevisionRef: { current: 2 },
    });

    saveCapturedPhoto(session);
    saveCapturedPhoto(session);

    expect(session.addPhoto).toHaveBeenCalledOnce();
    expect(session.addPhoto).toHaveBeenCalledWith(
      "data:image/png;base64,composed",
      "classic",
      "single-horizontal",
    );
    expect(session.broadcastPhoto).toHaveBeenCalledOnce();
    expect(session.broadcastPhoto.mock.calls[0][0]).toMatchObject({
      captureId: "cap",
      revision: 3,
      preview: false,
      dataUrl: "data:image/png;base64,composed",
    });
    expect(session.photoSavedRef.current).toBe(true);
    expect(session.setCanCustomizePreview).toHaveBeenCalledWith(false);
  });

  it("does not add or broadcast a photo before the host can customize", () => {
    const session = makeSession({ canCustomizePreview: false });

    saveCapturedPhoto(session);

    expect(session.addPhoto).not.toHaveBeenCalled();
    expect(session.broadcastPhoto).not.toHaveBeenCalled();
  });
});
