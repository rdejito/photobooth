import { getFrameThumbnail, clearFrameThumbnailCache } from "../frameThumbnail.js";

const THUMBNAIL = "data:image/jpeg;base64,thumb";

function createStubContext() {
  const gradient = { addColorStop: () => {} };
  return new Proxy(
    {},
    {
      get(target, property) {
        if (property === "measureText") return () => ({ width: 0 });
        if (property === "createLinearGradient" || property === "createRadialGradient") {
          return () => gradient;
        }
        if (property in target) return target[property];
        return vi.fn();
      },
      set(target, property, value) {
        target[property] = value;
        return true;
      },
    },
  );
}

function deferred() {
  let resolve;
  const promise = new Promise((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

describe("frame thumbnails", () => {
  beforeEach(() => {
    clearFrameThumbnailCache();
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { load: vi.fn(() => Promise.resolve([])) },
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(createStubContext);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(THUMBNAIL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders only after the frame's fonts have loaded", async () => {
    const fontsReady = deferred();
    document.fonts.load.mockImplementation(() => fontsReady.promise);

    const pending = getFrameThumbnail("pop");

    expect(HTMLCanvasElement.prototype.toDataURL).not.toHaveBeenCalled();

    fontsReady.resolve([]);

    await expect(pending).resolves.toBe(THUMBNAIL);
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledTimes(1);
  });

  it("shares one render between concurrent requests", async () => {
    const fontsReady = deferred();
    document.fonts.load.mockImplementation(() => fontsReady.promise);

    const first = getFrameThumbnail("pop");
    const second = getFrameThumbnail("pop");

    fontsReady.resolve([]);
    await expect(Promise.all([first, second])).resolves.toEqual([THUMBNAIL, THUMBNAIL]);
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledTimes(1);
  });

  it("reuses a rendered thumbnail without reloading fonts or redrawing", async () => {
    await getFrameThumbnail("pop");
    document.fonts.load.mockClear();
    HTMLCanvasElement.prototype.toDataURL.mockClear();

    await expect(getFrameThumbnail("pop")).resolves.toBe(THUMBNAIL);
    expect(document.fonts.load).not.toHaveBeenCalled();
    expect(HTMLCanvasElement.prototype.toDataURL).not.toHaveBeenCalled();
  });

  it("renders again after the cache is cleared", async () => {
    await getFrameThumbnail("pop");
    clearFrameThumbnailCache();
    HTMLCanvasElement.prototype.toDataURL.mockClear();

    await expect(getFrameThumbnail("pop")).resolves.toBe(THUMBNAIL);
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledTimes(1);
  });
});
