import fs from "node:fs/promises";
import { actionButtonVariants } from "../../theme/styles/actionButton.js";
import { cameraStageStyles } from "../../theme/styles/cameraStage.js";
import { boothWorkspaceStyles } from "../../theme/styles/boothTemplate.js";
import { photoControlsPanelStyles } from "../../theme/styles/photoControls.js";
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

  it("uses centred equal tracks so rows cannot fit more tiles than scored", () => {
    expect(videoGroup.display).toBe("grid");
    expect(videoGroup.flexWrap).toBeUndefined();
    expect(videoGroup.justifyItems).toBe("center");
    expect(videoGroup.alignItems).toBe("center");
    expect(videoGroup.alignContent).toBe("center");
    expect(videoGroup.justifyContent).toBe("center");
    expect(videoGroup.minWidth).toBe(0);
    expect(videoGroup.minHeight).toBe(0);
  });

  it("keeps each tile at its computed size inside its grid track", () => {
    const tile = videoPreviewStyles.tile;
    expect(tile.width).toBe("100%");
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

describe("booth workspace mobile regression", () => {
  it("keeps portrait phones in one column with the stage taking leftover height", () => {
    expect(boothWorkspaceStyles["@media (max-width: 380px)"]).toBeUndefined();
    const portrait =
      boothWorkspaceStyles["@media (max-width: 640px) and (orientation: portrait)"];

    expect(portrait).toMatchObject({
      gridTemplateRows: "minmax(0, 1fr) auto auto",
      gap: 0.75,
    });
    expect(portrait.gridTemplateColumns).toBeUndefined();
  });

  it("moves the controls into a right-hand rail only on short landscape", () => {
    expect(
      boothWorkspaceStyles[
        "@media (orientation: landscape) and (max-height: 500px)"
      ].gridTemplateColumns,
    ).toBe("minmax(0, 1fr) 168px");
  });
});

describe("booth button theme regression", () => {
  it("keeps secondary buttons on the dark theme instead of white", () => {
    expect(actionButtonVariants.secondary.sx.backgroundColor).toBe(
      "rgba(255,255,255,0.06)",
    );
    expect(actionButtonVariants.secondary.sx.color).toBe("#fffaf7");
  });

  it("gives leave booth a destructive outline", () => {
    expect(actionButtonVariants.quiet.variant).toBe("outlined");
    expect(actionButtonVariants.quiet.sx.color).toBe("#e5736b");
  });

  it("never lets a dock label wrap beside its icon", () => {
    expect(photoControlsPanelStyles["& .MuiButton-root"].whiteSpace).toBe("nowrap");
  });
});