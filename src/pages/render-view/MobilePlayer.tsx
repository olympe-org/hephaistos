import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, DownloadIcon } from "lucide-react";
import { usePauseOnHidden } from "@/hooks/usePauseOnHidden";

// The immersive, full-screen phone experience — this is how the vast
// majority of shared links are actually opened (someone taps it on their
// phone), so it stays a self-contained black canvas with no site chrome.
export default function MobilePlayer({
  loading,
  error,
  videoUrl,
  saving,
  onSave,
  onVideoReady,
  onVideoError,
}: {
  loading: boolean;
  error: string | null;
  videoUrl: string | null;
  saving: boolean;
  onSave: () => void;
  onVideoReady: () => void;
  onVideoError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  usePauseOnHidden(videoRef);

  if (error) {
    // Same shape as the 404 page (badge, accent heading, pill button), but in
    // literal white-on-black — this route stands alone (no Navbar, no theme
    // toggle), so it can't rely on the site's light/dark tokens.
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-black px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
          <span className="size-1.5 rounded-full bg-violet-400" />
          Lien indisponible
        </span>

        <h1 className="text-[clamp(1.75rem,7vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-balance text-white">
          Ce lien{" "}
          <span className="text-violet-400">n'est plus valide</span>.
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-white/50">
          Il a peut-être expiré, ou la vidéo a été supprimée. Découvre Vexia
          pour créer la tienne.
        </p>

        <Link
          to="/"
          className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Découvrir Vexia
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* Mounted as soon as the link's checked so it can actually start
          loading, but kept invisible until it confirms it can play — a
          passing link check doesn't guarantee the video itself will load. */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          playsInline
          controls
          onLoadedData={onVideoReady}
          onError={onVideoError}
          className={`h-full w-full object-contain ${loading ? "invisible" : ""}`}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {!loading && (
        <button
          onClick={onSave}
          disabled={saving}
          className="absolute right-4 bottom-[calc(2rem+env(safe-area-inset-bottom))] flex h-11 items-center gap-2 rounded-full bg-white/90 px-5 text-sm font-semibold text-black shadow-lg active:scale-95 disabled:opacity-50"
        >
          <DownloadIcon className="size-4" />
          {saving ? "..." : "Enregistrer"}
        </button>
      )}
    </div>
  );
}
