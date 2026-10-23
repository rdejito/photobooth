import { act, render, waitFor } from "@testing-library/react";
import FramePicker from "../organisms/FramePicker.jsx";
import { clearFrameThumbnailCache } from "../../rendering/frameThumbnail.js";

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

describe("frame picker thumbnails", () => {
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

  it("shows each frame thumbnail only after its fonts have loaded", async () => {
    const fontsReady = deferred();
    document.fonts.load.mockImplementation(() => fontsReady.promise);

    const { container } = render(<FramePicker frame="pop" setFrame={() => {}} />);

    expect(container.querySelectorAll("img")).toHaveLength(0);

    await act(async () => {
      fontsReady.resolve([]);
    });

    await waitFor(() => {
      expect(container.querySelectorAll("img")).toHaveLength(4);
    });
    expect(container.querySelector("img")).toHaveAttribute("src", THUMBNAIL);
  });
});
