import { MailIcon } from "lucide-react";
import { useAppSelector } from "@/store";
import type { RenderStatus } from "@/store/renderSlice";
import DownloadPhase from "./render-progress/DownloadPhase";
import { formatElapsed } from "./render-progress/formatElapsed";
import PhaseHeader from "./render-progress/PhaseHeader";
import { useJobTimeline } from "./render-progress/useJobTimeline";

const RUNNING_STATUSES: RenderStatus[] = ["pending", "downloading", "processing"];

// Tracks a render live: overall status, timer per phase (download, assembly),
// indicative progress and per-clip detail.
export default function RenderProgress() {
  const job = useAppSelector((s) => s.render.job);
  const timeline = useJobTimeline(job);

  if (!job) return null;

  const isCancelled = job.status === "cancelled";
  const isRunning = RUNNING_STATUSES.includes(job.status);
  const isDone = job.status === "done";
  const isFailed = job.status === "failed";
  const isProcessing = job.status === "processing";

  // Indicative progress: each clip is a step, plus one more for the final
  // assembly — climbs steadily through both phases instead of jumping to an
  // indeterminate state once downloads finish.
  const totalClips = job.clips?.length ?? 0;
  const doneClips = job.clips?.filter((c) => c.status === "done").length ?? 0;
  const totalSteps = totalClips + 1;
  const completedSteps = isDone ? totalSteps : isProcessing ? totalClips : doneClips;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  // Terminal states always win over the last live message — otherwise a
  // failure/cancellation kept showing whatever the backend last said while
  // it was still downloading (e.g. "Téléchargement en cours..."). The error
  // detail itself stays in the box below, not up here.
  const statusLabel = isDone
    ? "Vidéo prête"
    : isFailed
      ? "Erreur"
      : isCancelled
        ? "Annulé"
        : (job.message ?? "En attente…");

  return (
    <div className="flex flex-col gap-3">
      {/* Overall status */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <span
            className={`size-2.5 shrink-0 rounded-full ${
              isRunning
                ? "animate-pulse bg-violet-500 dark:bg-violet-400"
                : isDone
                  ? "bg-green-500"
                  : "bg-destructive"
            }`}
          />
          <span className="truncate text-sm font-medium">{statusLabel}</span>
          {timeline.totalElapsed !== null && (
            <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {formatElapsed(timeline.totalElapsed)}
            </span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${
              isFailed || isCancelled ? "bg-destructive" : "bg-foreground"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Discreet reminder: e-mail notification once the render is done */}
        {isRunning && (
          <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" />
            <span>Tu recevras un e-mail dès que la vidéo sera prête.</span>
          </div>
        )}
      </div>

      {/* Download phase */}
      {timeline.downloadingAt && (
        <DownloadPhase
          clips={job.clips}
          clipTimers={timeline.clipTimers}
          now={timeline.now}
          elapsed={timeline.downloadElapsed}
          isDownloading={job.status === "downloading"}
          isCancelled={isCancelled}
          hasStartedProcessing={!!timeline.processingAt}
        />
      )}

      {/* Assembly phase */}
      {timeline.processingAt && (
        <div className="rounded-2xl border border-border p-4">
          <PhaseHeader
            label="Assemblage"
            elapsed={timeline.processElapsed !== null ? formatElapsed(timeline.processElapsed) : null}
            done={isDone}
            running={isProcessing}
            cancelled={isCancelled && !timeline.doneAt}
          />
        </div>
      )}

      {/* Error */}
      {isFailed && job.error && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {job.error}
        </p>
      )}
    </div>
  );
}
