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
