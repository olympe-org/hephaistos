import { DownloadIcon, LoaderIcon, QrCodeIcon, Share2Icon, TrashIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import IconAction from "@/components/IconAction";
import { formatBytes, formatDuration } from "@/lib/format";
import { TERMINAL_STATUSES } from "@/lib/jobs";
import { copyShareLink } from "@/lib/shareLink";
import type { RenderJob } from "@/store/renderSlice";
import type { AdminUser } from "@/utils/api/admin";
import { cancelRender, downloadVideo } from "@/utils/api/render";

// Number of finished renders shown per account
const MAX_DONE_JOBS = 5;

export interface JobRef {
  id: string;
  title: string;
}

// An account's renders: in progress (live data) then finished (actions on hover)
export default function UserJobs({
  user,
  liveJobs,
  selectedJobId,
  onSelectJob,
  onCancelJob,
  onShowQr,
  onDeleteJob,
}: {
  user: AdminUser;
  liveJobs: Record<string, Partial<RenderJob>>;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onShowQr: (job: JobRef) => void;
  onDeleteJob: (job: JobRef) => void;
}) {
  const activeJobs = user.active_jobs ?? [];
  const doneJobs = user.jobs;

  if (activeJobs.length === 0 && doneJobs.length === 0) {
    return <p className="text-sm text-muted-foreground/60">Aucun rendu</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">
        <span>Rendus</span>
        <span className="tabular-nums">{activeJobs.length + doneJobs.length}</span>
      </div>

      <div className="divide-y divide-border">
        {/* In progress: status comes from the SSE stream when available */}
        {activeJobs.map((job) => {
          const live = liveJobs[job.job_id];
          const status = live?.status ?? job.status;
          const message = live?.message ?? job.message;
          const isFailed = status === "failed" || status === "cancelled";
          const isActive = !TERMINAL_STATUSES.has(status);

          return (
            <div
              key={job.job_id}
              className="group flex min-h-11 items-center gap-3 px-3.5 py-1.5 text-sm transition-colors hover:bg-muted/40"
            >
              <span className="w-5 shrink-0 text-xs text-muted-foreground/60">
                •
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={`truncate font-medium ${isFailed ? "text-destructive/70" : "text-muted-foreground/50"}`}
                >
                  {job.title}
                </span>
                {isActive && message && (
                  <span className="truncate text-xs text-muted-foreground/60">
                    {message}
                  </span>
                )}
                {isFailed && live?.error && (
                  <span className="truncate text-xs text-destructive/70">
                    {live.error}
                  </span>
                )}
              </div>
              {isActive && (
                <div className="flex shrink-0 items-center gap-2">
                  <LoaderIcon className="size-3.5 shrink-0 animate-spin text-muted-foreground/60" />
                  <IconAction
                    danger
                    aria-label="Annuler"
                    title="Annuler"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() =>
                      cancelRender(job.job_id)
                        .then(() => onCancelJob(job.job_id))
                        .catch(() => toast.error("Erreur lors de l'annulation."))
                    }
                  >
                    <XIcon />
                  </IconAction>
                </div>
              )}
            </div>
          );
        })}

        {/* Finished */}
        {doneJobs.slice(0, MAX_DONE_JOBS).map((job, idx) => {
          const isSelected = selectedJobId === job.id;
          const hasMeta = job.file_size_bytes != null || job.duration_seconds != null;

          return (
            <div
              key={job.id}
              className={`group flex h-11 items-center gap-3 px-3.5 text-sm transition-colors ${
                isSelected ? "bg-muted" : "hover:bg-muted/60"
              }`}
            >
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground/60">
                {idx + 1}
              </span>
              <button
                onClick={() => onSelectJob(job.id)}
                className={`flex-1 truncate text-left font-medium transition-colors ${
                  isSelected
                    ? "text-foreground"
                    : "cursor-pointer text-muted-foreground hover:text-foreground"
                }`}
              >
                {job.title}
              </button>
              <div className="flex shrink-0 items-center gap-3">
                {hasMeta && (
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
                      downloadVideo(job.id, job.title).catch(() =>
                        toast.error("Erreur de téléchargement."),
                      )
                    }
                  >
                    <DownloadIcon />
                  </IconAction>
                  <IconAction
                    aria-label="QR code"
                    title="QR code"
                    onClick={() => onShowQr({ id: job.id, title: job.title })}
                  >
                    <QrCodeIcon />
                  </IconAction>
                  <IconAction
                    aria-label="Partager"
                    title="Partager"
                    onClick={() =>
                      copyShareLink(job.id).catch(() =>
                        toast.error("Impossible de générer le lien de partage."),
                      )
                    }
                  >
                    <Share2Icon />
                  </IconAction>
                  <IconAction
                    danger
                    aria-label="Supprimer"
                    title="Supprimer"
                    onClick={() => onDeleteJob({ id: job.id, title: job.title })}
                  >
                    <TrashIcon />
                  </IconAction>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {doneJobs.length > MAX_DONE_JOBS && (
        <div className="border-t border-border px-3.5 py-2 text-xs text-muted-foreground">
          +{doneJobs.length - MAX_DONE_JOBS} de plus
        </div>
      )}
    </div>
  );
}
