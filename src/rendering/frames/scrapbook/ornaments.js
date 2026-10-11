/**
 * Decorative painters for the Scrapbook frame: board dots, a running-stitch
 * border, kraft washi tape and two pressed/stiched motifs (daisy, dried flower).
 */
import { roundedRectPath } from "../units.js";

/** Faint cream dots across the burgundy board. */
export function drawDots(context, width, height) {
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

/** Dashed stitch outline just inside the board edge. */
export function drawStitchBorder(context, width, height) {
  context.save();
  context.strokeStyle = "rgba(239,230,210,0.55)";
  context.lineWidth = 2;
  context.setLineDash([8, 7]);
  roundedRectPath(context, 12, 12, width - 24, height - 24, 10);
  context.stroke();
  context.restore();
}

/** A strip of kraft washi tape, rotated to `angle`. */
export function drawWashiTape(context, x, y, width, angle) {
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
export function drawDaisy(context, x, y, scale) {
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

/** Pressed dried flower, ready to be held by a strip of washi tape. */
export function drawPressedFlower(context, x, y, scale) {
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
