import { applyIncomingPhoto, applyIncomingPhotoClear } from "../peerInbox.js";

/** A fake session bundle whose setters mutate it so tests read the result. */
function makeSession(overrides = {}) {
  const session = {
    receivedPhotoRef: { current: null },
    frame: "classic",
    layout: "single-horizontal",
    photoDataUrl: "",
    canCustomizePreview: true,
    photoPending: false,
    showPreview: false,
    countdown: null,
    shotNumber: 0,
    clearCalls: 0,
    addPhoto: vi.fn(),
    setCountdown(value) { session.countdown = value; },
    setShotNumber(value) { session.shotNumber = value; },
    setPhotoDataUrl(value) { session.photoDataUrl = value; },
    setSelectedFrame(value) { session.frame = value; },
    setSelectedLayout(value) { session.layout = value; },
    setCanCustomizePreview(value) { session.canCustomizePreview = value; },
    setPhotoPending(value) { session.photoPending = value; },
    setShowPreview(value) { session.showPreview = value; },
    updateEventName: vi.fn(),
    triggerFlash: vi.fn(),
    clearSources() { session.clearCalls += 1; },
    ...overrides,
  };
  return session;
}

function preview(captureId, revision, fields = {}) {
  return {
    id: `${captureId}-${revision}`,
    captureId,
    revision,
    preview: true,
    dataUrl: `data:image/png;base64,${captureId}-${revision}`,
    frame: "classic",
    layout: "single-horizontal",
    eventName: "",
    ...fields,
  };
}

function saved(captureId, revision, fields = {}) {
  return { ...preview(captureId, revision, fields), preview: false };
}

describe("applyIncomingPhotoClear", () => {
  it("closes the guest's pending preview when the host dismisses it unsaved", () => {
    const session = makeSession();
    applyIncomingPhoto(preview("cap", 0), session);

    applyIncomingPhotoClear("cap", session);

    expect(session.showPreview).toBe(false);
    expect(session.photoPending).toBe(false);
    expect(session.canCustomizePreview).toBe(false);
    expect(session.photoDataUrl).toBe("");
  });

  it("dismisses when the clear arrives as a photo message", () => {
    const session = makeSession();
    applyIncomingPhoto(preview("cap", 0), session);

    applyIncomingPhoto({ cleared: true, captureId: "cap" }, session);

    expect(session.showPreview).toBe(false);
    expect(session.photoDataUrl).toBe("");
  });

  it("ignores a clear for a capture the guest is not showing", () => {
    const session = makeSession();
    applyIncomingPhoto(preview("cap-2", 0, { dataUrl: "cap-2-preview" }), session);

    applyIncomingPhotoClear("cap-1", session);

    expect(session.showPreview).toBe(true);
    expect(session.photoDataUrl).toBe("cap-2-preview");
  });

  it("never dismisses a saved photo", () => {
    const session = makeSession();
    applyIncomingPhoto(saved("cap", 1, { dataUrl: "final" }), session);

    applyIncomingPhotoClear("cap", session);

    expect(session.showPreview).toBe(true);
    expect(session.photoDataUrl).toBe("final");
  });

  it("ignores a clear before any photo has arrived", () => {
    const session = makeSession();
    session.setShowPreview(true);

    applyIncomingPhotoClear("cap", session);

    expect(session.showPreview).toBe(true);
  });

  it("keeps a late or duplicate revision of the dismissed capture closed", () => {
    const session = makeSession();
    applyIncomingPhoto(preview("cap", 0), session);
    applyIncomingPhotoClear("cap", session);

    applyIncomingPhoto(preview("cap", 1, { dataUrl: "late" }), session);

    expect(session.showPreview).toBe(false);
    expect(session.photoDataUrl).toBe("");
  });

  it("still opens the next capture's preview after a clear", () => {
    const session = makeSession();
    applyIncomingPhoto(preview("cap-1", 0), session);
    applyIncomingPhotoClear("cap-1", session);

    applyIncomingPhoto(preview("cap-2", 0, { dataUrl: "next-data" }), session);

    expect(session.showPreview).toBe(true);
    expect(session.photoDataUrl).toBe("next-data");
  });
});
