import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckIcon,
  DownloadIcon,
  LoaderIcon,
  Share2Icon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { usePauseOnHidden } from "@/hooks/usePauseOnHidden";
import { formatBytes, formatDuration } from "@/lib/format";
import type { VideoMeta } from "./shared";

// On desktop/tablet a bare full-screen video feels out of place — this
// renders the shared render as a real page of the site, with the navbar,
// title and the same light/dark theme as everywhere else. Sized to exactly
// fill the viewport (like the 404 page) so it never scrolls.
export default function DesktopPlayer({
  loading,
  error,
  videoUrl,
  meta,
  saving,
  onSave,
  onVideoLoadedMetadata,
  onVideoReady,
  onVideoError,
}: {
  loading: boolean;
  error: string | null;
  videoUrl: string | null;
  meta: VideoMeta;
  saving: boolean;
  onSave: () => void;
  onVideoLoadedMetadata: (duration: number) => void;
  onVideoReady: () => void;
  onVideoError: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  usePauseOnHidden(videoRef);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const title = meta.title ?? "Rendu Vexia";

  const metaLine = [
    meta.durationSeconds
      ? formatDuration(Math.round(meta.durationSeconds))
      : null,
    meta.sizeBytes ? formatBytes(meta.sizeBytes) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Navbar detachable={false} />

      <main
        className="mx-auto flex w-full max-w-5xl items-center justify-center px-6"
        style={{
          height: "calc(100vh - var(--nav-h))",
          marginTop: "var(--nav-h)",
        }}
      >
        {error ? (
          // Same badge/heading/button type scale as the 404 page, for consistency
          <div className="flex flex-col items-center text-center">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-violet-400" />
              Lien indisponible
            </span>
            <h1 className="text-[clamp(2.5rem,6.2vw,5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance">
              Ce lien{" "}
              <span className="text-violet-500 dark:text-violet-400">
                n'est plus valide
              </span>
              .
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Il a peut-être expiré, ou la vidéo a été supprimée. Découvre Vexia
              pour créer la tienne.
            </p>
            <Button
              asChild
              className="mt-9 h-12 rounded-full px-7 text-[15px]"
            >
              <Link to="/">
                Découvrir Vexia
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-16">
            {/* Kept invisible (not unmounted) until the video actually loads —
                a passing link check doesn't guarantee it, and the layout
                stays stable once it's revealed */}
            <div
              className={`flex w-full min-w-0 max-w-xs flex-col items-start justify-self-end gap-4 text-left ${loading ? "invisible" : ""}`}
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <h1 className="w-full flex-wrap text-balance wrap-break-word text-2xl font-semibold tracking-tight">
                  {title}
                </h1>
                {metaLine && (
                  <p className="text-sm text-muted-foreground">{metaLine}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2.5 shadow-sm">
                  <QRCodeSVG
                    value={window.location.href}
                    size={72}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Scanne pour ouvrir la vidéo sur ton téléphone.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={onSave}
                  disabled={saving || !videoUrl}
                  className="h-11 rounded-full px-6"
                >
                  <DownloadIcon className="size-4" />
                  {saving ? "..." : "Télécharger"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-11 rounded-full px-6"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="size-4 text-green-500" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Share2Icon className="size-4" />
                      Partager
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Créé avec{" "}
                <Link
                  to="/"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Vexia
                </Link>
              </p>
            </div>

            <div
              className={`relative shrink-0 overflow-hidden ${loading ? "" : "rounded-[24px] border border-border bg-muted/30 shadow-xl"}`}
              style={{ aspectRatio: "9/16", height: "min(78%, 620px)" }}
            >
              {/* Mounted as soon as the link check passes so it can actually
                  start loading — it must stay in the DOM while `loading` is
                  true, since it's the one that flips it to false via onLoadedData.
                  Only the card styling (border/shadow) is deferred, so no empty
                  box shows before the video is actually ready. */}
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  onLoadedMetadata={(e) =>
                    onVideoLoadedMetadata(e.currentTarget.duration)
                  }
                  onLoadedData={onVideoReady}
                  onError={onVideoError}
                  className={`h-full w-full object-cover ${loading ? "opacity-0" : ""}`}
                />
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Symmetric spacer so the video (an auto-width column) lands at
                the true horizontal center, not just centered against the info panel */}
            <div aria-hidden />
          </div>
        )}
      </main>
    </div>
  );
}
