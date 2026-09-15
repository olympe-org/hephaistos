import type { CSSProperties } from "react";
import type { GlobalTitleData } from "@/store/createVideoSlice";
import type { PreviewClip } from "@/utils/constants/fakePreview.constants";
import { CLIP_TITLE_X, RANK_X, VIDEO_W, headerBottom } from "./geometry";
import {
  animationStyle,
  hex,
  pos,
  posCenter,
  textStyle,
  type StyleKeyer,
} from "./styleHelpers";

// List of the first 5 clips for the "top" template, under the global title
export default function TopClipsList({
  clips,
  globalTitle,
  videoY,
  keyFor,
  highlightActiveIndex,
  inactiveColor,
  scale,
}: {
  clips: PreviewClip[];
  globalTitle: GlobalTitleData;
  videoY: number;
  keyFor: StyleKeyer;
  // Index of the clip currently playing, to dim the others during playback
  highlightActiveIndex: number | null;
  inactiveColor: string;
  scale: number;
}) {
  const hdrBottom = headerBottom(globalTitle);
  const visible = clips.slice(0, 5);
  const itemH = Math.max(
    70,
    (videoY - hdrBottom - 20) / Math.max(visible.length, 1),
  );

  return (
    <>
      {visible.map((clip, i) => {
        const itemY =
          hdrBottom + 20 + i * itemH + itemH / 2 - clip.idStyle.size * 0.6;
        const titleCentered = clip.titleStyle.position === "center";

        const isHighlighting = highlightActiveIndex !== null;
        const isActive = highlightActiveIndex === i;
        const dimmed = isHighlighting && !isActive;
        const overrides: CSSProperties = dimmed
          ? { color: hex(inactiveColor), opacity: 0.6 }
          : {};

        const titleStyle: CSSProperties = {
          ...textStyle(clip.titleStyle, undefined, scale),
          ...animationStyle(clip.titleStyle.animation),
          ...overrides,
        };
        const idStyle: CSSProperties = {
          ...textStyle(clip.idStyle, undefined, scale),
          ...overrides,
        };

        return (
          <div key={i}>
            {clip.id && <span style={pos(RANK_X, itemY, idStyle)}>{clip.id}</span>}
            {clip.title &&
              (titleCentered ? (
                <div style={posCenter(itemY)}>
                  <span
                    key={keyFor(clip.titleStyle)}
                    style={titleStyle}
                  >
                    {clip.title}
                  </span>
                </div>
              ) : (
                <span
                  key={keyFor(clip.titleStyle)}
                  style={pos(clip.id ? CLIP_TITLE_X : RANK_X, itemY, {
                    ...titleStyle,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: VIDEO_W - 150,
                  })}
                >
                  {clip.title}
                </span>
              ))}
          </div>
        );
      })}
    </>
  );
}
