import { render } from "@testing-library/react";
import { useRef } from "react";
import { useCameraTileSizing } from "../useCameraTileSizing.js";

let stageSize = { width: 600, height: 624 };
let resizeCallback = null;
let resizeDisconnect = vi.fn();

/** Minimal stage: the hook only needs a group and its tile children. */
function Stage({ count }) {
  const groupRef = useRef(null);
  useCameraTileSizing(groupRef, count);

  return (
    <div ref={groupRef} data-testid="group">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} data-testid={`tile-${index}`} />
      ))}
    </div>
  );
}

beforeEach(() => {
  stageSize = { width: 600, height: 624 };
  resizeCallback = null;
  resizeDisconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback) {
        resizeCallback = callback;
      }
      observe() {}
      disconnect() {
        resizeDisconnect();
      }
    },
  );
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
    if (element.dataset.testid === "group") {
      return { columnGap: "24px", rowGap: "24px" };
    }
    return { aspectRatio: "9 / 16" };
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => stageSize.width,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => stageSize.height,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete HTMLElement.prototype.clientWidth;
  delete HTMLElement.prototype.clientHeight;
});

describe("useCameraTileSizing", () => {
  it("uses the column count the layout math chose even when a third tile would fit", () => {
    const view = render(<Stage count={4} />);
    const group = view.getByTestId("group");

    // A wrapping flex row would fit three 168px tiles across 600px, rendering
    // 3+1 even though chooseColumns() picked two columns.
    expect(group.style.getPropertyValue("grid-template-columns")).toBe(
      "repeat(2, minmax(0, 1fr))",
    );
    expect(view.getByTestId("tile-0").style.width).toBe("168px");
    expect(view.getByTestId("tile-0").style.height).toBe("300px");
  });

  it("centres a lone trailing tile across the grid", () => {
    stageSize = { width: 600, height: 800 };
    const view = render(<Stage count={3} />);

    expect(view.getByTestId("group").style.getPropertyValue("grid-template-columns")).toBe(
      "repeat(2, minmax(0, 1fr))",
    );
    expect(view.getByTestId("tile-0").style.getPropertyValue("grid-column")).toBe("");
    expect(view.getByTestId("tile-2").style.getPropertyValue("grid-column")).toBe(
      "1 / -1",
    );
  });

  it("re-chooses the grid when the stage changes shape", () => {
    const view = render(<Stage count={2} />);
    const group = view.getByTestId("group");
    expect(group.style.getPropertyValue("grid-template-columns")).toBe(
      "repeat(2, minmax(0, 1fr))",
    );

    stageSize = { width: 600, height: 1200 };
    resizeCallback();

    expect(group.style.getPropertyValue("grid-template-columns")).toBe(
      "repeat(1, minmax(0, 1fr))",
    );
    expect(view.getByTestId("tile-0").style.width).toBe("330px");
  });

  it("disconnects its observers and listeners when the stage unmounts", () => {
    const view = render(<Stage count={2} />);
    const removeListener = vi.spyOn(window, "removeEventListener");

    view.unmount();

    expect(resizeDisconnect).toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith(
      "orientationchange",
      expect.any(Function),
    );
  });

  it("keeps mixed camera ratios inside their equal grid tracks", () => {
    stageSize = { width: 1200, height: 400 };
    window.getComputedStyle.mockImplementation((element) => {
      if (element.dataset.testid === "group") {
        return { columnGap: "24px", rowGap: "24px" };
      }
      if (element.dataset.testid === "tile-0") return { aspectRatio: "16 / 9" };
      return { aspectRatio: "9 / 16" };
    });

    const view = render(<Stage count={2} />);
    const trackWidth = (1200 - 24) / 2;
    const tiles = [0, 1].map((index) => view.getByTestId(`tile-${index}`));

    // A wide desktop beside a tall phone shares one tile height, but each
    // tile must still fit the equal track the grid gives it.
    expect(tiles[0].style.width).not.toBe("");
    for (const tile of tiles) {
      expect(parseFloat(tile.style.width)).toBeLessThanOrEqual(trackWidth);
      expect(parseFloat(tile.style.height)).toBeLessThanOrEqual(400);
    }
    expect(tiles[0].style.height).toBe(tiles[1].style.height);
  });
});
