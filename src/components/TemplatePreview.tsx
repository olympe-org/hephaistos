import { useEffect, useRef, useState } from "react";
import ClipAboveVideo from "./template-preview/ClipAboveVideo";
import ExpandedHeader from "./template-preview/ExpandedHeader";
import { getTemplateLayout, VIDEO_H, VIDEO_W } from "./template-preview/geometry";
import GlobalHeader from "./template-preview/GlobalHeader";
import { createStyleKeyer, hex } from "./template-preview/styleHelpers";
import TopClipsList from "./template-preview/TopClipsList";
import { useAppSelector } from "@/store";
import type { ClipData, GlobalTitleData } from "@/store/createVideoSlice";
import { FAKE_PREVIEW, type PreviewClip } from "@/utils/constants/fakePreview.constants";

function toPreviewClip(c: ClipData): PreviewClip {
  return {
    id: c.id,
    idStyle: c.idStyle,
    title: c.title,
    titleStyle: c.titleStyle,
    subtitle: c.subtitle,
    subtitleStyle: c.subtitleStyle,
  };
}

export interface FakeOverride {
  clips?: PreviewClip[];
  globalTitle?: GlobalTitleData;
  // Custom image/gif URL for the background and foreground
  bgSrc?: string;
  // "video" | "0xRRGGBB"
  background?: string;
}

// Preview faithful to the final video render (1080×1920, scaled to fit its container).
// - "live" mode: reflects the settings currently being edited (createVideo store)
// - "fake" mode: frozen data, for marketing demos (home, login…)
// - "image" mode: hides the whole text layer, for a plain thumbnail
export default function TemplatePreview({
  mode = "fake",
  templateOverride,
  fakeOverride,
}: {
  mode?: "fake" | "live" | "image";
  templateOverride?: string;
  fakeOverride?: FakeOverride;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const {
    templateValue: storeTemplateValue,
    globalTitle,
    clips,
    background,
    videoMargin,
    spacing: storeSpacing,
    watermark,
    highlightActive,
    highlightPreviewActiveIndex,
  } = useAppSelector((s) => s.createVideo);

  const templateValue = templateOverride ?? storeTemplateValue;

  // The container can be any size: we compute the scale so that the 1920px
  // "video" height fills it exactly.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => setScale(el.clientHeight / VIDEO_H);
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { videoY, videoH, defaultSpacing } = getTemplateLayout(templateValue);
  const clipSpacing = mode === "fake" ? defaultSpacing : storeSpacing;

  const fakeData = FAKE_PREVIEW[templateValue] ?? FAKE_PREVIEW.top;
  const isFake = mode === "fake";

  const activeBgSrc = fakeOverride?.bgSrc ?? fakeData.bgSrc;
  const activeBg = isFake ? (fakeOverride?.background ?? "video") : background;
  // In fake mode, the store's settings are ignored for a fully independent render
  const activeVideoMargin = isFake ? 0 : videoMargin;
  const activeGlobalTitle = isFake
    ? (fakeOverride?.globalTitle ?? fakeData.globalTitle)
    : globalTitle;
  const activeClips: PreviewClip[] = isFake
    ? (fakeOverride?.clips ?? fakeData.clips)
    : clips.map(toPreviewClip);
  const firstClip = activeClips[0];

  // Gives a stable id to each style object, so animated spans remount (and
  // replay their animation) only when the style actually changes.
  const [keyFor] = useState(createStyleKeyer);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: VIDEO_W,
          height: VIDEO_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        {/* Background */}
        {activeBg === "video" ? (
          <div style={{ position: "absolute", inset: 0, background: "#0d0d0d", overflow: "hidden" }}>
            {/* Wrapper div with the filter — more reliable than filter on img on mobile Chrome */}
            <div
              style={{
                position: "absolute",
                inset: -40,
                filter: "blur(20px) brightness(0.5)",
                WebkitFilter: "blur(20px) brightness(0.5)",
                transform: "translateZ(0)",
              }}
            >
              <img
                src={activeBgSrc}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: hex(activeBg) }} />
        )}

        {/* Foreground video */}
        <img
          src={activeBgSrc}
          style={{
            position: "absolute",
            left: activeVideoMargin,
            top: videoY,
            width: VIDEO_W - 2 * activeVideoMargin,
            height: videoH,
            objectFit: "cover",
          }}
        />

        {/* Text layer */}
        {mode !== "image" && (
          <>
            {(templateValue === "top" || templateValue === "classic") && activeGlobalTitle && (
              <GlobalHeader
                g={activeGlobalTitle}
                scale={scale}
              />
            )}
            {templateValue === "top" && activeGlobalTitle && (
              <TopClipsList
                clips={activeClips}
                globalTitle={activeGlobalTitle}
                videoY={videoY}
                keyFor={keyFor}
                highlightActiveIndex={highlightPreviewActiveIndex}
                inactiveColor={highlightActive.inactiveColor}
                scale={scale}
              />
            )}
            {(templateValue === "classic" || templateValue === "minimal") && firstClip && (
              <ClipAboveVideo
                clip={firstClip}
                videoY={videoY}
                spacing={clipSpacing}
                keyFor={keyFor}
                scale={scale}
              />
            )}
            {templateValue === "expanded" && (
              <ExpandedHeader
                clip={firstClip}
                spacing={clipSpacing}
                keyFor={keyFor}
                scale={scale}
              />
            )}
            {watermark.active && watermark.text && (
              <div
                style={{
                  position: "absolute",
                  left: activeVideoMargin + 30,
                  top: videoY + videoH - watermark.size - 20,
                  color: hex(watermark.color),
                  fontSize: watermark.size,
                  fontFamily: `"${watermark.font}", sans-serif`,
                  opacity: watermark.opacity,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {watermark.text}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
