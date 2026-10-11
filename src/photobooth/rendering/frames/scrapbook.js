import {
  DESIGN_UNITS,
  drawSlotPhoto,
  getDesignUnits,
  getSlotRects,
  getTemplateAnchors,
  roundedRectPath,
} from "./units.js";
import {
  fontStack,
  getCachedBackground,
  normalizeParticipants,
  resolveFrameLabels,
  seededNoise,
} from "./shared.js";

const BURGUNDY = "#5C0F1B";
const PAPER = "#F8F5EE";
const CREAM = "#EFE6D2";

function drawDots(context, width, height) {
  context.save();
  context.fillStyle = "rgba(255,240,220,0.14)";
  for (let y = 12; y < height; y += 22) {
    for (let x = 12; x < width; x += 22) {
      context.beginPath();
      context.arc(x, y, 1.6, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

function drawStitchBorder(context, width, height) {
  context.save();
  context.strokeStyle = "rgba(239,230,210,0.55)";
  context.lineWidth = 2;
  context.setLineDash([8, 7]);
  roundedRectPath(context, 12, 12, width - 24, height - 24, 10);
  context.stroke();
  context.restore();
}

/** A torn paper edge path from deterministic noise. */
function tornPath(context, x, y, width, height, seed) {
  context.beginPath();
  context.moveTo(x, y + 6);
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const px = x + (width * i) / steps;
    context.lineTo(px, y + seededNoise(seed + i) * 10);
  }
  for (let i = 0; i <= steps; i += 1) {
    const py = y + (height * i) / steps;
    context.lineTo(x + width - 4 + seededNoise(seed + 40 + i) * 8, py);
  }
  for (let i = 0; i <= steps; i += 1) {
    const px = x + width - (width * i) / steps;
    context.lineTo(px, y + height - 4 + seededNoise(seed + 80 + i) * 8);
  }
  for (let i = 0; i <= steps; i += 1) {
    const py = y + height - (height * i) / steps;
    context.lineTo(x + seededNoise(seed + 120 + i) * 8, py);
  }
  context.closePath();
}

function drawHandwritingLines(context, x, y, width, count, color) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 1.4;
  for (let index = 0; index < count; index += 1) {
    const ly = y + index * 16;
    context.beginPath();
    context.moveTo(x, ly);
    for (let px = 0; px <= width; px += 10) {
      context.lineTo(x + px, ly + Math.sin((px + index * 12) / 14) * 2.2);
    }
    context.stroke();
  }
  context.restore();
}

function drawWashiTape(context, x, y, width, angle) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.fillStyle = "rgba(196,164,120,0.85)";
  context.fillRect(-width / 2, -9, width, 18);
  context.fillStyle = "rgba(255,255,255,0.25)";
  for (let i = -width / 2; i < width / 2; i += 7) {
    context.fillRect(i, -7, 2, 14);
  }
  context.restore();
}

/** Stitched fabric daisy emblem. */
function drawDaisy(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.strokeStyle = "rgba(92,15,27,0.5)";
  context.lineWidth = 1.5;
  for (let petal = 0; petal < 7; petal += 1) {
    const angle = (petal / 7) * Math.PI * 2;
    context.save();
    context.rotate(angle);
    context.fillStyle = "#FBF7EC";
    context.beginPath();
    context.ellipse(0, -16, 7, 15, 0, 0, Math.PI * 2);
    context.fill();
    context.setLineDash([3, 3]);
    context.stroke();
    context.restore();
  }
  context.setLineDash([]);
  context.fillStyle = "#E6B93F";
  context.beginPath();
  context.arc(0, 0, 8, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(92,15,27,0.35)";
  for (let dot = 0; dot < 6; dot += 1) {
    const angle = (dot / 6) * Math.PI * 2;
    context.beginPath();
    context.arc(Math.cos(angle) * 4, Math.sin(angle) * 4, 1.4, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

/** Pressed dried flower held by kraft washi tape. */
function drawPressedFlower(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.strokeStyle = "#7C7C46";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 40);
  context.quadraticCurveTo(-10, 8, 4, -18);
  context.stroke();
  context.fillStyle = "rgba(168,138,102,0.75)";
  [[-16, 12], [14, 2], [-10, 26]].forEach(([lx, ly], index) => {
    context.save();
    context.rotate(index * 0.5 - 0.4);
    context.beginPath();
    context.ellipse(lx, ly, 10, 5, 0.5, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
  context.fillStyle = "rgba(154,86,104,0.8)";
  for (let petal = 0; petal < 6; petal += 1) {
    const angle = (petal / 6) * Math.PI * 2;
    context.beginPath();
    context.ellipse(Math.cos(angle) * 9, -18 + Math.sin(angle) * 9, 6, 4, angle, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = "#C89A3C";
  context.beginPath();
  context.arc(0, -18, 5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

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
