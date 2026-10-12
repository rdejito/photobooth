import fs from "node:fs/promises";
import { cameraStageStyles } from "../../theme/styles/cameraStage.js";
import { videoPreviewStyles } from "../../theme/styles/videoPreview.js";

describe("MUI setup docs and build coverage", () => {
  it("documents MUI/Emotion and retains the developer build instructions", async () => {
    const md = await fs.readFile(`${process.cwd()}/README.md`, "utf8");

    expect(md).toMatch(/\bMUI\b/i);
    expect(md).toMatch(/Emotion/i);
    expect(md).toMatch(/npm install/i);
    expect(md).toMatch(/npm run dev/i);
    expect(md).toMatch(/npm run build/i);
    expect(md).toMatch(/npm run preview/i);
  });
});

describe("camera stage breakpoint regression", () => {
  const { stage, videoGroup } = cameraStageStyles;

  it("wraps and centres tiles so mixed ratios cannot overflow or overlap", () => {
    expect(videoGroup.display).toBe("flex");
    expect(videoGroup.flexWrap).toBe("wrap");
    expect(videoGroup.alignItems).toBe("center");
    expect(videoGroup.alignContent).toBe("center");
    expect(videoGroup.justifyContent).toBe("center");
    expect(videoGroup.minWidth).toBe(0);
    expect(videoGroup.minHeight).toBe(0);
  });

  it("keeps each tile at its computed size instead of flex-shrinking", () => {
    const tile = videoPreviewStyles.tile;
    expect(tile.flex).toBe("0 0 auto");
    expect(tile.minWidth).toBe(0);
    expect(tile.minHeight).toBe(0);
  });

  it("tightens the stage gap and padding from desktop to phone", () => {
    expect(videoGroup.gap).toBe(1.5);
    expect(videoGroup["@media (min-width: 641px) and (max-width: 1024px)"]).toEqual({
      gap: 1.25,
    });
    expect(videoGroup["@media (max-width: 640px)"]).toEqual({ gap: 0.75 });
    expect(videoGroup["@media (max-width: 380px)"]).toEqual({ gap: 0.5 });

    expect(stage["@media (min-width: 641px) and (max-width: 1024px)"]).toMatchObject({
      p: 1.375,
    });
    expect(stage["@media (max-width: 640px)"]).toMatchObject({ p: 1.125 });
  });

  it("adapts the stage gap and padding to very large and very small viewports", () => {
    expect(videoGroup["@media (min-width: 1600px)"]).toEqual({ gap: 2 });
    expect(
      videoGroup["@media (max-width: 360px) and (orientation: portrait)"],
    ).toEqual({ gap: 0.375 });

    expect(stage["@media (min-width: 1600px)"]).toEqual({ p: 1.75 });
    expect(stage["@media (max-width: 360px) and (orientation: portrait)"]).toEqual({
      p: 1,
    });
  });

  it("keeps name labels inside narrow mixed-ratio tiles", () => {
    const label = videoPreviewStyles.label;
    expect(label.maxWidth).toBe("calc(100% - 22px)");
    expect(label["@media (max-width: 640px)"].maxWidth).toBe("calc(100% - 10px)");
  });
});