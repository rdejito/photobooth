/**
 * Scrapbook frame: a burgundy pin board with a stitched border, a torn cream
 * title scrap, a tilted photo-paper card holding the four slots, and
 * pressed-flower / daisy emblems held by washi tape. Ornaments live in
 * sibling modules; this entry point lays out the board.
 */
import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
} from "../units.js";
import {
  fontStack,
  getCachedBackground,
  normalizeParticipants,
  resolveFrameLabels,
} from "../shared.js";
import {
  drawDaisy,
  drawDots,
  drawPressedFlower,
  drawStitchBorder,
  drawWashiTape,
} from "./ornaments.js";
import { drawHandwritingLines, tornPath } from "./paper.js";

const BURGUNDY = "#5C0F1B";
const PAPER = "#F8F5EE";
const CREAM = "#EFE6D2";

export function renderScrapbook(canvas, context, participants, options = {}) {
  const layout = DESIGN_UNITS[options.layout] ? options.layout : "single-horizontal";
  const { width: designWidth, height: designHeight } = getDesignUnits(layout);
  const labels = resolveFrameLabels(options);
  const slots = getSlotRects(layout);
  const anchors = getTemplateAnchors(layout);
  const frames = options.groupShots?.length
    ? options.groupShots
    : normalizeParticipants(participants);

  canvas.width = designWidth;
  canvas.height = designHeight;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, designWidth, designHeight);

  const background = getCachedBackground({
    key: "scrapbook:board",
    width: designWidth,
    height: designHeight,
    draw: (bgContext, w, h) => {
      bgContext.fillStyle = BURGUNDY;
      bgContext.fillRect(0, 0, w, h);
      drawDots(bgContext, w, h);
      drawStitchBorder(bgContext, w, h);
    },
  });
  context.drawImage(background, 0, 0);

  // Torn scrap carrying the title, kept inside the board margins.
  const scrapWidth = layout === "single-vertical" ? 268 : 360;
  context.save();
  context.translate(anchors.title.x, anchors.title.y);
  context.rotate(-2 * (Math.PI / 180));
  context.shadowColor = "rgba(0,0,0,0.35)";
  context.shadowBlur = 12;
  context.shadowOffsetY = 5;
  tornPath(context, -scrapWidth / 2, -50, scrapWidth, 82, 7);
  context.fillStyle = CREAM;
  context.fill();
  context.restore();
  drawHandwritingLines(
    context,
    anchors.title.x - scrapWidth / 2 + 22,
    anchors.title.y + 2,
    scrapWidth - 44,
    2,
    "rgba(92,15,27,0.28)",
  );

  // Title on the scrap, in Caveat.
  context.save();
  context.translate(anchors.title.x, anchors.title.y);
  context.rotate(-2 * (Math.PI / 180));
  context.fillStyle = "#5C0F1B";
  context.font = `700 ${anchors.title.size}px ${fontStack("caveat")}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  anchors.titleLines.forEach((line, index) => {
    context.fillText(line, 0, (index - (anchors.titleLines.length - 1) / 2) * 30);
  });
  context.restore();

  // Photo-paper card tilted -1° with a drop shadow.
  const bounds = slots.reduce(
    (acc, slot) => ({
      x: Math.min(acc.x, slot.x),
      y: Math.min(acc.y, slot.y),
      r: Math.max(acc.r, slot.x + slot.width),
      b: Math.max(acc.b, slot.y + slot.height),
    }),
    { x: Infinity, y: Infinity, r: -Infinity, b: -Infinity },
  );
  const cardInset = 16;
  const card = {
    x: bounds.x - cardInset,
    y: bounds.y - cardInset,
    w: bounds.r - bounds.x + cardInset * 2,
    h: bounds.b - bounds.y + cardInset * 2,
  };
  context.save();
  context.translate(card.x + card.w / 2, card.y + card.h / 2);
  context.rotate(-1 * (Math.PI / 180));
  context.translate(-(card.x + card.w / 2), -(card.y + card.h / 2));
  context.shadowColor = "rgba(0,0,0,0.4)";
  context.shadowBlur = 20;
  context.shadowOffsetY = 8;
  context.fillStyle = PAPER;
  context.fillRect(card.x, card.y, card.w, card.h);
  context.restore();

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#FFFFFF",
      borderWidth: 5,
      placeholderFill: "#E4DED2",
      placeholderInk: "#9a9186",
      labelColor: "#7d7367",
      labelFont: `400 20px ${fontStack("specialElite")}`,
    });
  });

  // Emblems held by washi tape, in the board margins (never over a photo).
  // The flower sits below the last slot, on the board, not on the card.
  const flowerX = layout === "single-vertical" ? 296 : designWidth - 40;
  const flowerY = layout === "single-vertical" ? 1010 : designHeight - 30;
  drawPressedFlower(context, flowerX, flowerY, 0.95);
  drawWashiTape(context, flowerX - 34, flowerY - 30, 58, -0.35);
  const daisyY = layout === "single-vertical" ? 1028 : designHeight - 26;
  drawDaisy(context, layout === "single-vertical" ? 62 : 108, daisyY, 0.7);

  // Labels in Special Elite on a small paper tag.
  context.save();
  context.font = `400 18px ${fontStack("specialElite")}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const tagText = labels.hasEvent ? `${labels.date}   ${labels.event}` : labels.date;
  const tagWidth = Math.min(
    designWidth - 40,
    Math.max(180, context.measureText(tagText).width + 44),
  );
  const tagX = Math.min(
    Math.max(anchors.event.x, tagWidth / 2 + 24),
    designWidth - tagWidth / 2 - 24,
  );
  context.translate(tagX, anchors.event.y + 10);
  context.rotate(-0.8 * (Math.PI / 180));
  context.shadowColor = "rgba(0,0,0,0.3)";
  context.shadowBlur = 8;
  context.shadowOffsetY = 3;
  context.fillStyle = PAPER;
  context.fillRect(-tagWidth / 2, -20, tagWidth, 40);
  context.shadowColor = "transparent";
  context.fillStyle = "#4A3C34";
  context.fillText(tagText, 0, 1);
  context.restore();
}
