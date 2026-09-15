import type { GlobalTitleData } from "@/store/createVideoSlice";
import { posCenter, textStyle } from "./styleHelpers";

// Global title for the "top" / "classic" templates: two title lines + subtitle, centered
export default function GlobalHeader({
  g,
  scale,
}: {
  g: GlobalTitleData;
  scale: number;
}) {
  return (
    <>
      {g.first && (
        <div style={{ ...posCenter(120), ...textStyle(g.titleStyle, "center", scale) }}>
          {g.first}
        </div>
      )}
      {g.second && (
        <div style={{ ...posCenter(210), ...textStyle(g.titleStyle, "center", scale) }}>
          {g.second}
        </div>
      )}
      {g.subtitle && (
        <div style={{ ...posCenter(290), ...textStyle(g.subtitleStyle, "center", scale) }}>
          {g.subtitle}
        </div>
      )}
    </>
  );
}
