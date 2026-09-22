import { CheckIcon, ClockIcon, LoaderIcon, XIcon } from "lucide-react";
import type { ClipRenderData } from "@/store/renderSlice";
import type { ClipTiming } from "./useJobTimeline";
import { formatElapsed } from "./formatElapsed";
import PhaseHeader from "./PhaseHeader";

function ClipRow({
  clip,
  timing,
  now,
  stopped,
}: {
  clip: ClipRenderData;
  timing: ClipTiming | undefined;
  now: number;
  // Cancelled or failed — either way the clip isn't actively progressing
  // anymore, so it shouldn't keep showing a spinner/clock.
  stopped: boolean;
}) {
  const isTiming = timing && (timing.end ?? (clip.status === "downloading" ? now : null));
  const elapsed = isTiming ? formatElapsed((timing!.end ?? now) - timing!.start) : null;

  return (
    <div className="flex items-center gap-2.5">
      {clip.status === "done" && <CheckIcon className="size-3.5 shrink-0 text-green-500" />}
      {clip.status === "downloading" &&
        (stopped ? (
          <XIcon className="size-3.5 shrink-0 text-destructive" />
        ) : (
          <LoaderIcon className="size-3.5 shrink-0 animate-spin text-violet-500 dark:text-violet-400" />
        ))}
      {clip.status === "pending" &&
        (stopped ? (
          <XIcon className="size-3.5 shrink-0 text-destructive" />
        ) : (
          <ClockIcon className="size-3.5 shrink-0 text-muted-foreground/50" />
        ))}
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{clip.id}</span>
      <span className="truncate text-sm">{clip.title}</span>
      {elapsed && (
        <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {elapsed}
        </span>
      )}
    </div>
  );
}

// "Download" phase: header + one row per clip
export default function DownloadPhase({
  clips,
  clipTimers,
  now,
  elapsed,
  isDownloading,
  isCancelled,
  isFailed,
  hasStartedProcessing,
}: {
  clips: ClipRenderData[] | undefined;
  clipTimers: Record<string, ClipTiming>;
  now: number;
  elapsed: number | null;
  isDownloading: boolean;
  isCancelled: boolean;
  isFailed: boolean;
  hasStartedProcessing: boolean;
}) {
  // A failure during assembly still leaves the download phase genuinely done;
  // a failure during download itself means it never actually finished.
  const stopped = isCancelled || isFailed;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
      <PhaseHeader
        label="Téléchargement"
        elapsed={elapsed !== null ? formatElapsed(elapsed) : null}
        done={(!isDownloading && !stopped) || hasStartedProcessing}
        running={isDownloading && !stopped}
        cancelled={isCancelled && !hasStartedProcessing}
        failed={isFailed && !hasStartedProcessing}
      />

      {clips && clips.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          {clips.map((clip, i) => (
            <ClipRow
              key={i}
              clip={clip}
              timing={clipTimers[clip.id]}
              now={now}
              stopped={stopped}
            />
          ))}
        </div>
      )}
    </div>
  );
}
