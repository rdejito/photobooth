import { render } from "@testing-library/react";
import { useRef } from "react";
import { useCameraTileSizing } from "../useCameraTileSizing.js";

let stageSize = { width: 600, height: 624 };

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
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
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
});
