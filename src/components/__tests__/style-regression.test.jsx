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

  it("keeps the video grid from overflowing on any screen size", () => {
    expect(videoGroup.minWidth).toBe(0);
    expect(videoGroup.minHeight).toBe(0);
    expect(videoGroup.gridTemplateColumns).toBe("minmax(0, 1fr)");
    expect(videoGroup.gridTemplateRows).toBe("minmax(0, 1fr)");
  });

  it("lays 2, 3 and 4 participants out on the expected columns", () => {
    expect(
      videoGroup['&[data-participant-count="2"]'].gridTemplateColumns,
    ).toBe("repeat(2, minmax(0, 1fr))");
    const dense =
      videoGroup['&[data-participant-count="3"], &[data-participant-count="4"]'];
    expect(dense.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
    expect(dense.gridTemplateRows).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("centres the odd third tile across both stage columns", () => {
    expect(videoGroup['&[data-participant-count="3"] > :nth-of-type(3)']).toMatchObject({
      gridColumn: "1 / -1",
      justifySelf: "center",
    });
  });

  it("tightens the grid gap and stage padding from desktop to phone", () => {
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

  it("keeps name labels inside narrow mixed-ratio tiles", () => {
    const label = videoPreviewStyles.label;
    expect(label.maxWidth).toBe("calc(100% - 22px)");
    expect(label["@media (max-width: 640px)"].maxWidth).toBe("calc(100% - 10px)");
  });
});