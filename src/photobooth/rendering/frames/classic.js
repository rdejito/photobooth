import {
  PHOTO_HEIGHT,
  PORTRAIT_WIDTH,
  drawOuterFrameRails,
  drawPortraitStrip,
  getStripWidth,
} from "../canvas.js";

export function renderClassic(canvas, context, participants) {
  const pad = 58;
  const gap = 24;
  const railWidth = 28;
  const headerHeight = 82;
  const footerHeight = 34;
  canvas.width = getStripWidth(participants.length, pad, gap);
  canvas.height = headerHeight + PHOTO_HEIGHT + footerHeight + pad;

  const paper = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  paper.addColorStop(0, "#fffaf0");
  paper.addColorStop(1, "#f6e8d6");
  context.fillStyle = paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawOuterFrameRails(context, canvas.width, headerHeight, PHOTO_HEIGHT, railWidth, {
    background: "#f6e8d6",
    accent: "#d9a28e",
    detail: "#8c5360",
    pattern: "ornaments",
  });
  context.fillStyle = "#8c5360";
  context.font = "bold 13px 'Courier New'";
  context.textAlign = "center";
  context.fillText("A LITTLE MOMENT TO KEEP", canvas.width / 2, 25);
  context.fillStyle = "#33272a";
  context.font = "bold 27px Georgia";
  context.fillText("The photobooth crew", canvas.width / 2, 59);

  drawPortraitStrip(
    context,
    participants,
    pad,
    headerHeight,
    PORTRAIT_WIDTH,
    PHOTO_HEIGHT,
    gap,
    12,
    { borderColor: "#fffdf8", borderWidth: 8 },
  );
  context.fillStyle = "#8c5360";
  context.font = "italic 14px Georgia";
  context.fillText(
    "Captured with love  ·  " + new Date().toLocaleDateString(),
    canvas.width / 2,
    canvas.height - 11,
  );
}
