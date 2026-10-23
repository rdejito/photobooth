import { act, renderHook, waitFor } from "@testing-library/react";
import { usePhotoGallery } from "../usePhotoGallery.js";

const STORAGE_KEY = "photobooth-gallery";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePhotoGallery loading", () => {
  it.each([
    ["null", "null"],
    ["an object", JSON.stringify({ photos: [] })],
  ])("ignores stored JSON that is %s", (_label, stored) => {
    localStorage.setItem(STORAGE_KEY, stored);

    const { result } = renderHook(() => usePhotoGallery());

    expect(result.current.gallery).toEqual([]);
    act(() => {
      result.current.addPhoto("data:image/png;base64,photo", "classic");
    });
    expect(result.current.gallery).toHaveLength(1);
  });
});

describe("usePhotoGallery persistence", () => {
  it("reloads a saved photo with its frame and layout", () => {
    const first = renderHook(() => usePhotoGallery());
    act(() => {
      first.result.current.addPhoto(
        "data:image/png;base64,photo",
        "classic",
        "grid-2x2",
      );
    });
    first.unmount();

    const second = renderHook(() => usePhotoGallery());

    expect(second.result.current.gallery).toEqual([
      expect.objectContaining({
        dataUrl: "data:image/png;base64,photo",
        frame: "classic",
        layout: "grid-2x2",
      }),
    ]);
  });

  it("keeps a deleted photo out of storage", () => {
    const first = renderHook(() => usePhotoGallery());
    let photo;
    act(() => {
      photo = first.result.current.addPhoto("data:image/png;base64,photo", "classic");
    });
    act(() => {
      first.result.current.deletePhoto(photo.id);
    });
    first.unmount();

    const second = renderHook(() => usePhotoGallery());

    expect(second.result.current.gallery).toEqual([]);
  });

  it("defaults a gallery entry to the horizontal layout", () => {
    const { result } = renderHook(() => usePhotoGallery());

    let photo;
    act(() => {
      photo = result.current.addPhoto("data:image/png;base64,photo", "classic");
    });

    expect(photo).toMatchObject({
      dataUrl: "data:image/png;base64,photo",
      frame: "classic",
      layout: "single-horizontal",
    });
  });

  it("recovers from malformed stored JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() => usePhotoGallery());

    expect(result.current.gallery).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });
});

describe("usePhotoGallery storage status", () => {
  it("reports a full browser storage instead of failing silently", async () => {
    const { result } = renderHook(() => usePhotoGallery());
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    act(() => {
      result.current.addPhoto("data:image/png;base64,photo", "classic");
    });

    await waitFor(() => {
      expect(result.current.storageStatus).toMatch(/storage is full/i);
    });
    expect(result.current.gallery).toHaveLength(1);
  });
});
