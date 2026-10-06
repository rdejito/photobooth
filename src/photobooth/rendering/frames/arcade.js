import {
  PHOTO_HEIGHT,
  PORTRAIT_WIDTH,
  drawOuterFrameRails,
  drawPortraitStrip,
  getStripWidth,
} from "../canvas.js";

export function renderArcade(canvas, context, participants) {
  const pad = 58;
  const gap = 10;
  const railWidth = 28;
  const headerHeight = 76;
  const footerHeight = 37;
  canvas.width = getStripWidth(participants.length, pad, gap);
  canvas.height = headerHeight + PHOTO_HEIGHT + footerHeight + pad;

  const backdrop = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  backdrop.addColorStop(0, "#090d25");
  backdrop.addColorStop(0.5, "#17143b");
  backdrop.addColorStop(1, "#271037");
  context.fillStyle = backdrop;
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawOuterFrameRails(context, canvas.width, headerHeight, PHOTO_HEIGHT, railWidth, {
    background: "#0d1230",
    accent: "#53f6e4",
    detail: "#ff5bd6",
    pattern: "pixels",
  });
  context.strokeStyle = "#53f6e4";
  context.lineWidth = 3;
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  context.fillStyle = "#53f6e4";
  context.font = "bold 12px 'Courier New'";
  context.textAlign = "center";
  context.fillText("CO-OP PHOTO MODE", canvas.width / 2, 27);
  context.shadowColor = "#53f6e4";
  context.shadowBlur = 12;
  context.fillStyle = "#fff";
  context.font = "bold 25px 'Courier New'";
  context.fillText("THE WHOLE CREW", canvas.width / 2, 60);
  context.shadowBlur = 0;

  drawPortraitStrip(context, participants, pad, headerHeight, PORTRAIT_WIDTH, PHOTO_HEIGHT, gap, 8);
  context.strokeStyle = "#53f6e4";
  context.lineWidth = 2;
  participants.forEach((_, index) => {
    context.strokeRect(
      pad + index * (PORTRAIT_WIDTH + gap) - 1,
      headerHeight - 1,
      PORTRAIT_WIDTH + 2,
      PHOTO_HEIGHT + 2,
    );
  });
  context.fillStyle = "#ffcc67";
  context.font = "bold 12px 'Courier New'";
  context.fillText(
    "PHOTO PARTY  ·  " + new Date().toLocaleDateString(),
    canvas.width / 2,
    canvas.height - 13,
  );
}
