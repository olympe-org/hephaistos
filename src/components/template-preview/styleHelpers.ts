import type { CSSProperties } from "react";
import type { ClipData, GlobalTitleData } from "@/store/createVideoSlice";
import { VIDEO_W } from "./geometry";

// "0xRRGGBB" or "#RRGGBB" → "#RRGGBB" (white if the format is unexpected)
export function hex(c: string): string {
  if (c.startsWith("0x")) return "#" + c.slice(2);
  return c.startsWith("#") ? c : "#ffffff";
}

export type TextStyle =
  | ClipData["idStyle"]
  | ClipData["titleStyle"]
  | GlobalTitleData["titleStyle"];

// CSS style for a piece of text (font, color, stroke) from the store's settings
export function textStyle(
  s: TextStyle,
  align?: "left" | "center",
  scale = 1,
): CSSProperties {
  const style: CSSProperties = {
    color: hex(s.color),
    fontSize: s.size,
    fontFamily: `"${s.font}", sans-serif`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    // Disable font-smoothing to match the FFmpeg/FreeType render
    WebkitFontSmoothing: "none",
  };
  if (s.border > 0) {
    // Compensates for the CSS scale so the visible stroke matches the real video
    style.WebkitTextStroke = `${s.border / scale}px #000`;
    style.paintOrder = "stroke fill";
  }
  if (align) style.textAlign = align;
  return style;
}

export function pos(x: number, y: number, extra?: CSSProperties): CSSProperties {
  return { position: "absolute", left: x, top: y, ...extra };
}

// Horizontally centered positioning: flex + justifyContent rather than
// textAlign, more reliable for content of varying width.
export function posCenter(y: number): CSSProperties {
  return {
    position: "absolute",
    left: 0,
    top: y,
    width: VIDEO_W,
    display: "flex",
    justifyContent: "center",
  };
}

export function animationStyle(animation: string): CSSProperties {
  switch (animation) {
    case "fade":
      return { animation: "preview-fade 0.3s ease-out forwards" };
    case "slide-left":
      return { animation: "preview-slide-left 0.3s ease-out forwards" };
    case "slide-bottom":
      return { animation: "preview-slide-bottom 0.3s ease-out forwards" };
    case "typewriter":
      return { animation: "preview-typewriter 1.2s steps(30, end) forwards" };
    default:
      return {};
  }
}

// Each style (object from the store) gets a stable id → animated spans remount
// individually when their style changes, so the animation replays.
export function createStyleKeyer() {
  const ids = new WeakMap<object, number>();
  let next = 0;
  return (style: object) => {
    if (!ids.has(style)) ids.set(style, next++);
    return ids.get(style)!;
  };
}

export type StyleKeyer = ReturnType<typeof createStyleKeyer>;
