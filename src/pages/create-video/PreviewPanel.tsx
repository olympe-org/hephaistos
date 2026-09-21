import { useRef, type RefObject } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import TemplatePreview from "@/components/TemplatePreview";
import { usePauseOnHidden } from "@/hooks/usePauseOnHidden";
import { capitalize } from "@/utils";

// Right column: 9:16 preview (animated, can be paused) while editing, then the
// actual video once the render is done
export default function PreviewPanel({
  currentStep,
  templateValue,
  isDone,
  isRunning,
  videoUrl,
  columnHeightClass,
  hasBottomGap,
  previewContainerRef,
  previewPaused,
  previewResetKey,
  onTogglePreview,
}: {
  currentStep: number;
  templateValue: string;
  isDone: boolean;
  isRunning: boolean;
  videoUrl: string | null;
  // Same column height as the left panel (depends on the guest banner)
  columnHeightClass: string;
  // The app shows a guest banner above the nav: the column then needs to be a
  // bit shorter to stay aligned with the main column
  hasBottomGap: boolean;
  previewContainerRef: RefObject<HTMLDivElement | null>;
  previewPaused: boolean;
  // Changes to force the preview to remount when playback resumes
  previewResetKey: number;
  onTogglePreview: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  usePauseOnHidden(videoRef);

  const title =
    currentStep === 3
      ? isDone
        ? "Rendu final"
        : isRunning
          ? "En cours…"
          : "Rendu"
      : capitalize(templateValue);

  const showVideo = currentStep === 3 && videoUrl;

  return (
    <div className={`flex shrink-0 flex-col ${columnHeightClass} pt-2 pb-8`}>
      <div className="flex shrink-0 flex-col gap-1.5 pb-6">
        <span className="text-sm text-muted-foreground">Aperçu</span>
        <h2 className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
          {title}
        </h2>
      </div>

      <div className="h-px shrink-0 bg-border" />

      <div className="flex flex-1 items-center justify-center pt-6">
        <div
          className="group relative shrink-0 overflow-hidden rounded-[24px] border border-border bg-muted/30"
          style={{
            height: hasBottomGap
              ? "calc(100vh - var(--nav-h) - 2.5rem - 120px)"
              : "calc(100vh - var(--nav-h) - 2.5rem - 2.5rem - 120px)",
            aspectRatio: "9/16",
          }}
        >
          {showVideo ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              playsInline
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              ref={previewContainerRef}
              className={`h-full w-full ${previewPaused ? "preview-paused" : ""}`}
            >
              <TemplatePreview
                key={previewResetKey}
                mode={currentStep === 1 ? "fake" : "live"}
              />
            </div>
          )}
          {!showVideo && (
            <button
              onClick={onTogglePreview}
              className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70"
            >
              {previewPaused ? (
                <PlayIcon className="size-3.5 text-white" />
              ) : (
                <PauseIcon className="size-3.5 text-white" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
