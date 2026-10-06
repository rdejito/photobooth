import {
  PHOTO_HEIGHT,
  drawFrameSideRail,
  drawPortraitStrip,
  getStripWidth,
} from "../canvas.js";

export function renderPolaroid(canvas, context, participants) {
  const pad = 24;
  const gap = 18;
  const cardWidth = 280;
  const cardHeight = PHOTO_HEIGHT + 18;
  const bottomPad = 56;
  const topPad = 59;
  const photoInset = 20;
  canvas.width = getStripWidth(participants.length, pad, gap, cardWidth);
  canvas.height = topPad + cardHeight + bottomPad + pad;
  const paper = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  paper.addColorStop(0, "#e8ded1");
  paper.addColorStop(1, "#cfc0b2");
  context.fillStyle = paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textAlign = "center";
  context.fillStyle = "#5e5148";
  context.font = "bold 15px 'Courier New'";
  context.fillText("THE PHOTOBOOTH CLUB", canvas.width / 2, 26);
  context.fillStyle = "#86766b";
  context.font = "12px 'Courier New'";
  context.fillText(new Date().toLocaleDateString(), canvas.width / 2, 45);

  participants.forEach((participant, index) => {
    const x = pad + index * (cardWidth + gap);
    context.save();
    context.shadowColor = "rgba(66,48,38,0.28)";
    context.shadowBlur = 15;
    context.shadowOffsetY = 7;
    context.fillStyle = "#fffdf8";
    context.fillRect(x, topPad, cardWidth, cardHeight + bottomPad);
    context.restore();
    drawFrameSideRail(
      context,
      x + 5,
      topPad + 9,
      11,
      PHOTO_HEIGHT - 18,
      {
        background: "#f4eee5",
        accent: "#ad806a",
        detail: "#ddc5a3",
        pattern: "medallions",
      },
    );
    drawFrameSideRail(
      context,
      x + cardWidth - 16,
      topPad + 9,
      11,
      PHOTO_HEIGHT - 18,
      {
        background: "#f4eee5",
        accent: "#ad806a",
        detail: "#ddc5a3",
        pattern: "medallions",
      },
    );
    drawPortraitStrip(
      context,
      [participant],
      x + photoInset,
      topPad + 9,
      cardWidth - photoInset * 2,
      PHOTO_HEIGHT - 18,
      0,
      2,
    );
    context.fillStyle = "#4d4540";
    context.font = "italic 16px Georgia";
    context.fillText(participant.label, x + cardWidth / 2, topPad + cardHeight + 34);
  });
}
