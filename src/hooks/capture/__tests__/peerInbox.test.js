import { applyIncomingCountdown, applyIncomingPhoto } from "../peerInbox.js";
import { CAPTURE_MOMENT } from "../captureSequence.js";

/**
 * A fake version of the mutable session bundle `usePhotoCapture` passes to the
 * inbox helpers. Setters mutate the object so tests can assert the guest's
 * resulting view directly.
 */
function makeSession(overrides = {}) {
  const session = {
    receivedPhotoRef: { current: null },
    frame: "classic",
    layout: "single-horizontal",
    photoDataUrl: "",
    canCustomizePreview: true,
    photoPending: false,
    showPreview: false,
    eventName: "",
    countdown: null,
    shotNumber: 0,
    photos: [],
    flashes: 0,
    clearCalls: 0,
    setCountdown(value) { session.countdown = value; },
    setShotNumber(value) { session.shotNumber = value; },
    setPhotoDataUrl(value) { session.photoDataUrl = value; },
    setSelectedFrame(value) { session.frame = value; },
    setSelectedLayout(value) { session.layout = value; },
    setCanCustomizePreview(value) { session.canCustomizePreview = value; },
    setPhotoPending(value) { session.photoPending = value; },
    setShowPreview(value) { session.showPreview = value; },
    updateEventName(value) { session.eventName = value; },
    addPhoto(dataUrl, frame, layout) {
      session.photos.push({ dataUrl, frame, layout });
      return { id: `photo-${session.photos.length}` };
    },
    triggerFlash() { session.flashes += 1; },
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

describe("applyIncomingPhoto", () => {
  it("shows the host's preview with the host's frame, layout and event name", () => {
    const session = makeSession();

    applyIncomingPhoto(
      preview("cap", 0, {
        dataUrl: "data:image/png;base64,host-preview",
        frame: "polaroid",
        layout: "grid-2x2",
        eventName: "Emma's birthday",
      }),
      session,
    );

    expect(session.photoDataUrl).toBe("data:image/png;base64,host-preview");
    expect(session.frame).toBe("polaroid");
    expect(session.layout).toBe("grid-2x2");
    expect(session.eventName).toBe("Emma's birthday");
    expect(session.showPreview).toBe(true);
    expect(session.photoPending).toBe(true);
    expect(session.receivedPhotoRef.current).toEqual({
      captureId: "cap",
      revision: 0,
      saved: false,
    });
  });

  it("keeps the guest preview read-only and clears any local capture sources", () => {
    const session = makeSession();

    applyIncomingPhoto(preview("cap", 0), session);

    expect(session.canCustomizePreview).toBe(false);
    expect(session.clearCalls).toBe(1);
  });

  it("applies each later revision so the guest sees the latest frame and layout", () => {
    const session = makeSession();

    applyIncomingPhoto(preview("cap", 0, { dataUrl: "rev0", frame: "classic" }), session);
    applyIncomingPhoto(
      preview("cap", 1, { dataUrl: "rev1", frame: "polaroid", layout: "single-vertical" }),
      session,
    );

    expect(session.photoDataUrl).toBe("rev1");
    expect(session.frame).toBe("polaroid");
    expect(session.layout).toBe("single-vertical");
  });

  it("ignores out-of-order and duplicate revisions so no stale frame/layout is shown", () => {
    const session = makeSession();

    applyIncomingPhoto(preview("cap", 2, { dataUrl: "rev2", frame: "film" }), session);
    applyIncomingPhoto(preview("cap", 1, { dataUrl: "rev1", frame: "classic" }), session);
    applyIncomingPhoto(preview("cap", 2, { dataUrl: "rev2b", frame: "arcade" }), session);

    expect(session.photoDataUrl).toBe("rev2");
    expect(session.frame).toBe("film");
    expect(session.receivedPhotoRef.current.revision).toBe(2);
  });

  it("adds the saved photo to the gallery and replaces the preview", () => {
    const session = makeSession();

    applyIncomingPhoto(preview("cap", 0), session);
    applyIncomingPhoto(
      saved("cap", 1, { dataUrl: "final", frame: "polaroid", layout: "grid-2x2" }),
      session,
    );

    expect(session.photos).toEqual([
      { dataUrl: "final", frame: "polaroid", layout: "grid-2x2" },
    ]);
    expect(session.photoDataUrl).toBe("final");
    expect(session.photoPending).toBe(false);
    expect(session.receivedPhotoRef.current.saved).toBe(true);
  });

  it("never lets a late preview or duplicate save replace the saved photo", () => {
    const session = makeSession();

    applyIncomingPhoto(saved("cap", 1, { dataUrl: "final" }), session);
    applyIncomingPhoto(preview("cap", 2, { dataUrl: "late-preview" }), session);
    applyIncomingPhoto(saved("cap", 3, { dataUrl: "duplicate-save" }), session);

    expect(session.photoDataUrl).toBe("final");
    expect(session.photos).toHaveLength(1);
    expect(session.photoPending).toBe(false);
    expect(session.showPreview).toBe(true);
  });

  it("lets a saved photo win over a preview revision that already arrived", () => {
    const session = makeSession();

    applyIncomingPhoto(preview("cap", 5, { dataUrl: "preview-5" }), session);
    applyIncomingPhoto(saved("cap", 4, { dataUrl: "save-4" }), session);

    expect(session.photoDataUrl).toBe("save-4");
    expect(session.photos).toEqual([
      { dataUrl: "save-4", frame: "classic", layout: "single-horizontal" },
    ]);
  });

  it("starts fresh previews for a new capture after an earlier one was saved", () => {
    const session = makeSession();

    applyIncomingPhoto(saved("cap-1", 2, { dataUrl: "cap1-final" }), session);
    applyIncomingPhoto(
      preview("cap-2", 0, { dataUrl: "cap2-preview", frame: "arcade", layout: "grid-2x2" }),
      session,
    );

    expect(session.photoDataUrl).toBe("cap2-preview");
    expect(session.frame).toBe("arcade");
    expect(session.layout).toBe("grid-2x2");
    expect(session.showPreview).toBe(true);
    expect(session.photoPending).toBe(true);
  });

  it("falls back to a valid capture id and the guest's frame/layout when omitted", () => {
    const session = makeSession({ frame: "film", layout: "single-vertical" });

    applyIncomingPhoto(
      { id: "solo-0", revision: 0, preview: true, dataUrl: "solo" },
      session,
    );

    expect(session.receivedPhotoRef.current.captureId).toBe("solo-0");
    expect(session.frame).toBe("film");
    expect(session.layout).toBe("single-vertical");
  });
});

describe("applyIncomingCountdown", () => {
  it("mirrors the host's countdown and shot number", () => {
    const session = makeSession();

    applyIncomingCountdown(3, { shot: 2, total: 4 }, session);

    expect(session.countdown).toBe(3);
    expect(session.shotNumber).toBe(2);
    expect(session.flashes).toBe(0);
  });

  it("flashes locally at the capture moment", () => {
    const session = makeSession();

    applyIncomingCountdown(CAPTURE_MOMENT, { shot: 4, total: 4 }, session);

    expect(session.triggerFlash).toBeDefined();
    expect(session.flashes).toBe(1);
    expect(session.countdown).toBe(CAPTURE_MOMENT);
    expect(session.shotNumber).toBe(4);
  });

  it("clears the countdown and shot number when the host stops", () => {
    const session = makeSession();

    applyIncomingCountdown(null, undefined, session);

    expect(session.countdown).toBeNull();
    expect(session.shotNumber).toBe(0);
  });
});
