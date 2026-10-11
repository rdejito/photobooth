import { downloadDataUrl, littleMomentsFilename } from "../download.js";

describe("littleMomentsFilename", () => {
  it("builds the app-wide photo filename", () => {
    expect(littleMomentsFilename("abc-123")).toBe("little-moments-abc-123.png");
  });
});

describe("downloadDataUrl", () => {
  it("clicks a temporary anchor with the data URL and filename", () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgo=";
    let element;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function click() {
        element = this;
      });

    downloadDataUrl(dataUrl, littleMomentsFilename("snap-7"));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(element.href).toBe(dataUrl);
    expect(element.download).toBe("little-moments-snap-7.png");
  });
});