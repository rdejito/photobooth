import {
  PHOTO_HEIGHT,
  PORTRAIT_WIDTH,
  drawPortraitStrip,
  drawRoundRectPath,
  getStripWidth,
} from "../canvas.js";

export function renderFilm(canvas, context, participants) {
  const holeRadius = 8;
  const holeGap = 30;
  const stripWidth = 34;
  const pad = 9;
  const footerHeight = 28;
  const gap = 20;
  const photosWidth = getStripWidth(participants.length, pad, gap);
  canvas.width = photosWidth + stripWidth * 2;
  canvas.height = PHOTO_HEIGHT + pad * 2 + footerHeight;
  const base = context.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, "#312b26");
  base.addColorStop(0.5, "#171615");
  base.addColorStop(1, "#312b26");
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const drawSprocketStrip = (x) => {
    context.fillStyle = "#211e1b";
    context.fillRect(x, 0, stripWidth, canvas.height);
    context.fillStyle = "#d9c7a5";
    for (let y = holeGap / 2; y < canvas.height - footerHeight; y += holeGap) {
      drawRoundRectPath(
        context,
        x + stripWidth / 2 - holeRadius,
        y - holeRadius,
        holeRadius * 2,
        holeRadius * 2,
        3,
      );
      context.fill();
    }
  };

  drawSprocketStrip(0);
  drawSprocketStrip(canvas.width - stripWidth);
  drawPortraitStrip(
    context,
    participants,
    stripWidth + pad,
    pad,
    PORTRAIT_WIDTH,
    PHOTO_HEIGHT,
    gap,
    3,
    { borderColor: "#f5f0e6", borderWidth: 6 },
  );
  context.fillStyle = "#e3c997";
  context.font = "bold 10px 'Courier New'";
  context.textAlign = "center";
  context.fillText(
    "PHOTO PARTY  ·  " + new Date().toLocaleDateString(),
    canvas.width / 2,
    canvas.height - 9,
  );
}
