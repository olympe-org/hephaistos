import type { PreviewClip } from "@/utils/constants/fakePreview.constants";
import { RANK_X, VIDEO_W } from "./geometry";
import { animationStyle, pos, posCenter, textStyle, type StyleKeyer } from "./styleHelpers";

// Title (+ subtitle) shown above the video, for "classic" and "minimal"
export default function ClipAboveVideo({
  clip,
  videoY,
  spacing,
  keyFor,
  scale,
}: {
  clip: PreviewClip;
  videoY: number;
  spacing: number;
  keyFor: StyleKeyer;
  scale: number;
}) {
  const titleCentered = clip.titleStyle.position === "center";

  const renderText = (
    y: number,
    text: string,
    style: PreviewClip["titleStyle"] | PreviewClip["subtitleStyle"],
    centered: boolean,
  ) => {
    const span = (
      <span
        key={keyFor(style)}
        style={{ ...textStyle(style, undefined, scale), ...animationStyle(style.animation) }}
      >
        {text}
      </span>
    );
    return centered ? (
      <div style={posCenter(y)}>{span}</div>
    ) : (
      <div style={pos(RANK_X, y, { maxWidth: VIDEO_W - 100, overflow: "hidden" })}>
        {span}
      </div>
    );
  };

  if (clip.subtitle) {
    const subY = videoY - spacing - clip.subtitleStyle.size;
    const titleY = subY - spacing - clip.titleStyle.size;
    return (
      <>
        {clip.title &&
          renderText(titleY, clip.title, clip.titleStyle, titleCentered)}
        {renderText(
          subY,
          clip.subtitle,
          clip.subtitleStyle,
          clip.subtitleStyle.position === "center",
        )}
      </>
    );
  }

  if (!clip.title) return null;
  const titleY = videoY - spacing - clip.titleStyle.size;
  return renderText(titleY, clip.title, clip.titleStyle, titleCentered);
}
