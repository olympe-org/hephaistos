import { Link } from "react-router-dom";
import { ArrowRightIcon, DownloadIcon, LoaderIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDuration } from "@/lib/format";
import type { VideoMeta } from "./shared";

// On desktop/tablet a bare full-screen video feels out of place — this
// renders the shared render as a real page of the site, with the navbar,
// title and the same light/dark theme as everywhere else.
export default function DesktopPlayer({
  loading,
  error,
  videoUrl,
  meta,
  saving,
  onSave,
  onVideoLoadedMetadata,
  onVideoError,
}: {
  loading: boolean;
  error: string | null;
  videoUrl: string | null;
  meta: VideoMeta;
  saving: boolean;
  onSave: () => void;
  onVideoLoadedMetadata: (duration: number) => void;
  onVideoError: () => void;
}) {
  // Fixed output format, true for every render regardless of this job's data
  const metaLine = [
    "1080 × 1920",
    meta.durationSeconds ? formatDuration(Math.round(meta.durationSeconds)) : null,
    meta.sizeBytes ? formatBytes(meta.sizeBytes) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar detachable={false} />
      <main
        className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-6 pb-16 text-center"
        style={{ paddingTop: "calc(var(--nav-h) + 3rem)" }}
      >
        {error ? (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-violet-400" />
              Lien indisponible
            </span>
            <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-balance">
              Cette vidéo{" "}
              <span className="text-violet-500 dark:text-violet-400">n'est plus disponible</span>.
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{error}</p>
            <Button asChild className="mt-2 h-12 rounded-full px-7 text-[15px]">
              <Link to="/">
                Découvrir Vexia
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <div
              className="relative w-full max-w-70 shrink-0 overflow-hidden rounded-[24px] border border-border bg-muted/30 shadow-xl"
              style={{ aspectRatio: "9/16" }}
            >
              {loading || !videoUrl ? (
                <div className="flex h-full w-full items-center justify-center">
                  <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  onLoadedMetadata={(e) => onVideoLoadedMetadata(e.currentTarget.duration)}
                  onError={onVideoError}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-semibold tracking-tight">{meta.title ?? "Ta vidéo"}</h1>
              {metaLine && <p className="text-sm text-muted-foreground">{metaLine}</p>}
            </div>

            <Button
              onClick={onSave}
              disabled={saving || !videoUrl}
              className="h-12 rounded-full px-7 text-[15px]"
            >
              <DownloadIcon className="size-4" />
              {saving ? "..." : "Télécharger"}
            </Button>

            <p className="mt-6 text-xs text-muted-foreground">
              Créé avec{" "}
              <Link to="/" className="font-medium text-foreground underline-offset-4 hover:underline">
                Vexia
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
