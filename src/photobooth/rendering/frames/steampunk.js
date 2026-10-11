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
} from "./shared.js";

const LEATHER = "#2E1D14";
const BRASS = "#C79A4B";
const COPPER = "#8C4A1F";
const TEXT = "#F1E3C6";

function drawLeatherDots(context, width, height) {
  context.save();
  context.fillStyle = "rgba(199,154,75,0.12)";
  for (let y = 10; y < height; y += 16) {
    for (let x = 10; x < width; x += 16) {
      context.beginPath();
      context.arc(x, y, 1.2, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

function drawRivetedBorder(context, width, height) {
  context.save();
  context.strokeStyle = BRASS;
  context.lineWidth = 10;
  roundedRectPath(context, 12, 12, width - 24, height - 24, 10);
  context.stroke();
  context.strokeStyle = "rgba(46,29,20,0.55)";
  context.lineWidth = 3;
  roundedRectPath(context, 18, 18, width - 36, height - 36, 8);
  context.stroke();

  context.fillStyle = "#E4C67B";
  for (let x = 34; x < width - 20; x += 52) {
    [17, height - 17].forEach((y) => {
      context.beginPath();
      context.arc(x, y, 3.4, 0, Math.PI * 2);
      context.fill();
    });
  }
  for (let y = 34; y < height - 20; y += 52) {
    [17, width - 17].forEach((x) => {
      context.beginPath();
      context.arc(x, y, 3.4, 0, Math.PI * 2);
      context.fill();
    });
  }
  context.restore();
}

/** Brass gear, partly cropped at a corner. */
function drawGear(context, x, y, radius, teeth, color) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  const points = teeth * 4;
  for (let index = 0; index < points; index += 1) {
    const angle = (index / points) * Math.PI * 2;
    const r = index % 4 < 2 ? radius : radius * 0.78;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fill();
  // Hub is filled with the leather tone (never destination-out, which would
  // erase through to a black hole instead of reading as a gear).
  context.fillStyle = LEATHER;
  context.beginPath();
  context.arc(0, 0, radius * 0.34, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, radius * 0.34, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

/** Pressure-gauge emblem. */
function drawGauge(context, x, y) {
  context.save();
  context.translate(x, y);
  context.fillStyle = BRASS;
  context.beginPath();
  context.arc(0, 0, 30, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#1B120C";
  context.beginPath();
  context.arc(0, 0, 24, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = BRASS;
  context.lineWidth = 2;
  for (let index = 0; index <= 6; index += 1) {
    const angle = Math.PI * 0.75 + (index / 6) * Math.PI * 1.5;
    context.beginPath();
    context.moveTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
    context.lineTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
    context.stroke();
  }
  context.strokeStyle = "#E05C4A";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(9, -10);
  context.stroke();
  context.restore();
}

export function renderSteampunk(canvas, context, participants, options = {}) {
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
    key: "steampunk:leather",
    width: designWidth,
    height: designHeight,
    draw: (bgContext, w, h) => {
      bgContext.fillStyle = LEATHER;
      bgContext.fillRect(0, 0, w, h);
      drawLeatherDots(bgContext, w, h);
    },
  });
  context.drawImage(background, 0, 0);

  // Gears centred on two corners so they are cropped by the canvas edge and
  // cannot reach into a photo slot.
  drawGear(context, 6, 6, 54, 10, "rgba(199,154,75,0.92)");
  drawGear(context, designWidth - 6, designHeight - 6, 48, 9, "rgba(140,74,31,0.95)");

  drawRivetedBorder(context, designWidth, designHeight);

  // Thick brass frames with a copper outer edge and inset shadow.
  slots.forEach((slot) => {
    context.save();
    context.fillStyle = COPPER;
    context.fillRect(slot.x - 16, slot.y - 16, slot.width + 32, slot.height + 32);
    context.fillStyle = BRASS;
    context.fillRect(slot.x - 11, slot.y - 11, slot.width + 22, slot.height + 22);
    const inset = context.createLinearGradient(slot.x, slot.y, slot.x, slot.y + slot.height);
    inset.addColorStop(0, "rgba(0,0,0,0.45)");
    inset.addColorStop(0.25, "rgba(0,0,0,0)");
    context.fillStyle = inset;
    context.fillRect(slot.x, slot.y, slot.width, slot.height);
    context.restore();
  });

  slots.forEach((slot, index) => {
    drawSlotPhoto(context, slot, frames[index], {
      label: `PHOTO ${index + 1}`,
      borderColor: "#3A2417",
      borderWidth: 4,
      placeholderFill: "#402C1E",
      placeholderInk: "#B79B5B",
      labelColor: TEXT,
      labelFont: `400 20px ${fontStack("specialElite")}`,
    });
  });

  drawGauge(context, anchors.emblem.x, anchors.emblem.y);

  context.save();
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.font = `700 ${anchors.title.size}px ${fontStack("rye")}`;
  anchors.titleLines.forEach((line, index) => {
    const y = anchors.title.y + index * anchors.title.lineHeight;
    context.fillStyle = "rgba(0,0,0,0.55)";
    context.fillText(line, anchors.title.x + 3, y + 3);
    context.fillStyle = TEXT;
    context.fillText(line, anchors.title.x, y);
  });
  context.font = `400 18px ${fontStack("specialElite")}`;
  context.fillStyle = BRASS;
  // Kept clear of the cropped gear in the bottom-right corner.
  context.fillText(labels.date, anchors.date.x - 120, anchors.date.y);
  if (labels.hasEvent) {
    context.fillStyle = TEXT;
    context.fillText(labels.event, anchors.event.x, anchors.event.y);
  }
  context.restore();
}
