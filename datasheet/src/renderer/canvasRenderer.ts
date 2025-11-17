import { FormatSpec } from "../headless/models/Cell";
import type { R, X, Y, Width, Height, Datum } from "../types";

export const drawCell = (
  ctx: CanvasRenderingContext2D,
  x: R<X>,
  y: R<Y>,
  w: Width,
  h: Height,
  datum: Datum,
  formatting: FormatSpec
): void => {
  // -------- 1. FILL -------- //
  if (formatting.fill) {
    ctx.fillStyle = formatting.fill;
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.clearRect(x, y, w, h);
  }

  // -------- 2. BORDERS -------- //
  // canvas has no built-in per-side borders, so we draw each side manually.
  const drawSide = (
    side: "top" | "right" | "bottom" | "left",
    spec: FormatSpec["borders"][typeof side]
  ) => {
    if (spec.style === "none" || spec.width <= 0) return;

    ctx.save();

    ctx.strokeStyle = spec.color;
    ctx.lineWidth = spec.width;

    // dashed/dotted support
    if (spec.style === "dashed") ctx.setLineDash([6, 3]);
    else if (spec.style === "dotted") ctx.setLineDash([1, 2]);
    else if (spec.style === "double") {
      // crude but visually serviceable: two parallel lines
      ctx.beginPath();
      if (side === "top" || side === "bottom") {
        const y0 = side === "top" ? y : y + h;
        ctx.moveTo(x, y0 - spec.width / 2);
        ctx.lineTo(x + w, y0 - spec.width / 2);
        ctx.moveTo(x, y0 + spec.width / 2);
        ctx.lineTo(x + w, y0 + spec.width / 2);
      } else {
        const x0 = side === "left" ? x : x + h;
        ctx.moveTo(x0 - spec.width / 2, y);
        ctx.lineTo(x0 - spec.width / 2, y + h);
        ctx.moveTo(x0 + spec.width / 2, y);
        ctx.lineTo(x0 + spec.width / 2, y + h);
      }
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    switch (side) {
      case "top":
        ctx.moveTo(x, y + spec.width / 2);
        ctx.lineTo(x + w, y + spec.width / 2);
        break;
      case "bottom":
        ctx.moveTo(x, y + h - spec.width / 2);
        ctx.lineTo(x + w, y + h - spec.width / 2);
        break;
      case "left":
        ctx.moveTo(x + spec.width / 2, y);
        ctx.lineTo(x + spec.width / 2, y + h);
        break;
      case "right":
        ctx.moveTo(x + w - spec.width / 2, y);
        ctx.lineTo(x + w - spec.width / 2, y + h);
        break;
    }
    ctx.stroke();
    ctx.restore();
  };

  drawSide("top", formatting.borders.top);
  drawSide("right", formatting.borders.right);
  drawSide("bottom", formatting.borders.bottom);
  drawSide("left", formatting.borders.left);

  // -------- 3. FONT -------- //
  const f = formatting.font;

  const fontPieces = [];
  if (f.italic) fontPieces.push("italic");
  if (f.bold) fontPieces.push("bold");
  fontPieces.push(`${f.size}px`);
  fontPieces.push(f.family || "sans-serif");

  ctx.font = fontPieces.join(" ");
  ctx.fillStyle = f.color || "#000";

  // -------- 4. ALIGNMENT → CANVAS ANCHORS -------- //
  // Canvas alignment has limited axes, so we map your schema:
  //
  // horizontal: left | center | right → textAlign
  // vertical: top | middle | bottom → textBaseline + manual offset

  // Horizontal
  switch (formatting.alignment.horizontal) {
    case "left":
      ctx.textAlign = "left";
      break;
    case "center":
      ctx.textAlign = "center";
      break;
    case "right":
      ctx.textAlign = "right";
      break;
    default:
      ctx.textAlign = "left";
  }

  // Vertical mapping
  let baselineY: number;
  switch (formatting.alignment.vertical) {
    case "top":
      ctx.textBaseline = "top";
      baselineY = y + 2; // small pad
      break;
    case "middle":
      ctx.textBaseline = "middle";
      baselineY = y + h / 2;
      break;
    case "bottom":
      ctx.textBaseline = "bottom";
      baselineY = y + h - 2;
      break;
    default:
      ctx.textBaseline = "middle";
      baselineY = y + h / 2;
  }

  // -------- 5. TEXT CONTENT -------- //
  // For now: no wrapping—honor overflow/wrap/clip later.
  const text = datum === null || datum === undefined ? "" : String(datum);

  let baselineX: number;
  switch (formatting.alignment.horizontal) {
    case "left":
      baselineX = x + 4;
      break;
    case "center":
      baselineX = x + w / 2;
      break;
    case "right":
      baselineX = x + w - 4;
      break;
    default:
      baselineX = x + 4;
  }

  // Simple clipping if required
  ctx.save();
  if (formatting.alignment.wrap === "clip") {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }

  ctx.fillText(text, baselineX, baselineY);

  ctx.restore();
};

export default drawCell;
