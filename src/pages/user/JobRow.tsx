import { useState } from "react";
import { DownloadIcon, LoaderIcon, QrCodeIcon, Share2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import IconAction from "@/components/IconAction";
import QrDialog from "@/components/QrDialog";
import { formatBytes, formatDuration } from "@/lib/format";
import { copyShareLink } from "@/lib/shareLink";
import type { RenderJob } from "@/store/renderSlice";
import type { MeJob } from "@/utils/api/auth";
import { cancelRender, downloadVideo } from "@/utils/api/render";

// A render's row: in progress (progress + cancel), finished (preview,
// download, QR), failed or cancelled
export default function JobRow({
  job,
  idx,
  isActive,
  selectedJobId,
  onSelect,
  liveData,
  onCancelled,
}: {
  job: MeJob;
  idx: number;
  isActive: boolean;
  selectedJobId: string | null;
  onSelect: (id: string) => void;
  liveData?: Partial<RenderJob>;
  onCancelled: (id: string) => void;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const status = liveData?.status ?? job.status;
  const isDone = status === "done";
  const isFailed = status === "failed";
  const isCancelled = status === "cancelled";
  const isRunning = isActive && !isDone && !isFailed && !isCancelled;
  const isSelected = selectedJobId === job.job_id;

  // Message from the backend, otherwise the clip currently downloading
  const currentClip = liveData?.clips?.find((c) => c.status === "downloading");
  const progressLabel =
    liveData?.message ?? (currentClip ? `Clip : ${currentClip.title}` : null);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelRender(job.job_id);
      onCancelled(job.job_id);
    } catch {
      toast.error("Erreur lors de l'annulation.");
    } finally {
      setCancelling(false);
    }
  };

  const rowClass = isRunning
    ? "bg-violet-500/5 dark:bg-violet-400/5"
    : isSelected
      ? "bg-muted"
      : isDone
        ? "hover:bg-muted/60"
        : isFailed
          ? "bg-destructive/5"
          : "";

  const titleClass = isRunning
    ? "text-violet-500 dark:text-violet-400"
    : isSelected
      ? "text-foreground"
      : isFailed
        ? "text-destructive"
        : isDone
          ? "cursor-pointer text-muted-foreground hover:text-foreground"
          : "cursor-default text-muted-foreground/50";

  return (
    <>
      <div className={`group flex flex-col px-4 py-2 transition-colors ${rowClass}`}>
        <div className="flex min-h-8 items-center gap-3">
          <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground/60">
            {idx}
          </span>

          <button
            onClick={isDone ? () => onSelect(job.job_id) : undefined}
            disabled={!isDone}
            className={`flex-1 truncate text-left text-sm font-medium transition-colors ${titleClass}`}
          >
            {job.title}
          </button>

          {isRunning && (
            <div className="flex shrink-0 items-center gap-2">
              <LoaderIcon className="size-3.5 animate-spin text-violet-500/70 dark:text-violet-400/70" />
              <IconAction
                danger
                aria-label="Annuler"
                title="Annuler"
                className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <LoaderIcon className="animate-spin" />
                ) : (
                  <XIcon />
                )}
              </IconAction>
            </div>
          )}

          {isFailed && (
            <span className="shrink-0 text-xs font-medium text-destructive">
              Erreur
            </span>
          )}

          {isCancelled && (
            <span className="shrink-0 text-xs text-muted-foreground/50">
              Annulé
            </span>
          )}

          {isDone && (
            <div className="flex shrink-0 items-center gap-3">
              {(job.file_size_bytes != null ||
                job.duration_seconds != null) && (
                <span className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                  {job.duration_seconds != null && (
                    <span>{formatDuration(job.duration_seconds)}</span>
                  )}
                  {job.file_size_bytes != null && (
                    <span>{formatBytes(job.file_size_bytes)}</span>
                  )}
                </span>
              )}
              <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <IconAction
                  aria-label="Télécharger"
                  title="Télécharger"
                  onClick={() =>
                    downloadVideo(job.job_id).catch(() =>
                      toast.error("Erreur de téléchargement."),
                    )
                  }
                >
                  <DownloadIcon />
                </IconAction>
                <IconAction
                  aria-label="QR code"
                  title="QR code"
                  onClick={() => setQrOpen(true)}
                >
                  <QrCodeIcon />
                </IconAction>
                <IconAction
                  aria-label="Partager"
                  title="Partager"
                  onClick={() =>
                    copyShareLink(job.job_id).catch(() =>
                      toast.error("Impossible de générer le lien de partage."),
                    )
                  }
                >
                  <Share2Icon />
                </IconAction>
              </div>
            </div>
          )}
        </div>

        {isRunning && progressLabel && (
          <p className="truncate pb-0.5 pl-9 text-xs text-violet-500/70 dark:text-violet-400/60">
            {progressLabel}
          </p>
        )}

        {isFailed && liveData?.error && (
          <p className="truncate pb-0.5 pl-9 text-xs text-destructive/70">
            {liveData.error}
          </p>
        )}
      </div>

      <QrDialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        jobId={job.job_id}
        title={job.title}
      />
    </>
  );
}
