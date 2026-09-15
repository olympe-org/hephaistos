import type { PreviewClip } from "@/utils/constants/fakePreview.constants";
import { RANK_X, VIDEO_W } from "./geometry";
import { animationStyle, pos, posCenter, textStyle, type StyleKeyer } from "./styleHelpers";

// Title (+ subtitle) for the "expanded" template: banner centered vertically at the top
export default function ExpandedHeader({
  clip,
  spacing,
  keyFor,
  scale,
}: {
  clip: PreviewClip | undefined;
  spacing: number;
  keyFor: StyleKeyer;
  scale: number;
}) {
  if (!clip?.title) return null;

  const blockHeight =
    clip.titleStyle.size +
    (clip.subtitle ? spacing + clip.subtitleStyle.size : 0);
  const topOffset = Math.max(0, (250 - blockHeight) / 2);

  const renderText = (
    y: number,
    text: string,
    style: PreviewClip["titleStyle"] | PreviewClip["subtitleStyle"],
  ) => {
    const span = (
      <span
        key={keyFor(style)}
        style={{ ...textStyle(style, undefined, scale), ...animationStyle(style.animation) }}
      >
        {text}
      </span>
    );
    return style.position === "center" ? (
      <div style={posCenter(y)}>{span}</div>
    ) : (
      <div style={pos(RANK_X, y, { maxWidth: VIDEO_W - 100, overflow: "hidden" })}>
        {span}
      </div>
    );
  };

  return (
    <>
      {renderText(topOffset, clip.title, clip.titleStyle)}
      {clip.subtitle &&
        renderText(topOffset + clip.titleStyle.size + spacing, clip.subtitle, clip.subtitleStyle)}
    </>
  );
}
