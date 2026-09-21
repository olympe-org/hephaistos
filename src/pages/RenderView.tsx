import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRightIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

// FastAPI errors come back as { detail: "message" } or { detail: { message } }
function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return fallback;
}

async function saveVideo(blob: Blob) {
  const file = new File([blob], "video.mp4", { type: "video/mp4" });

  // iOS Safari + modern Android Chrome: native share sheet → "Save to Photos"
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Vidéo" });
    return;
  }

  // Fallback: classic download link (Android Chrome, desktop)
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function RenderView() {
  usePageMeta({ title: "Ta vidéo · Vexia", path: "/render", indexable: false });

  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const downloadUrl =
    jobId && token ? `${BASE_URL}/jobs/${jobId}/download?token=${token}` : null;

  // Set only once the link has been checked — the <video> tag then streams
  // it progressively itself, no need to wait for (or hold in memory) the
  // whole file just to display it.
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!downloadUrl) {
      setError("Lien invalide.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        // Quick access check (catches an expired/invalid share link with its
        // real error message) — aborted right after, before the body is
        // streamed, so this never downloads the video itself.
        const res = await fetch(downloadUrl, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(errorMessage(body, "Vidéo non disponible."));
        }
        controller.abort();
        setVideoUrl(downloadUrl);
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Impossible de charger la vidéo.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [downloadUrl]);

  const handleSave = async () => {
    if (!downloadUrl) return;
    setSaving(true);

    let blob: Blob;
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error();
      blob = await res.blob();
    } catch {
      toast.error("Impossible de récupérer la vidéo.");
      setSaving(false);
      return;
    }

    try {
      await saveVideo(blob);
    } catch {
      // User cancelled the share sheet — not an error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

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
          Cette vidéo{" "}
          <span className="text-violet-400">n'est plus disponible</span>.
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-white/50">{error}</p>

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
      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          loop
          playsInline
          controls
          onError={() => setError("Impossible de lire la vidéo.")}
          className="h-full w-full object-contain"
        />
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="absolute right-4 bottom-[calc(2rem+env(safe-area-inset-bottom))] flex h-11 items-center gap-2 rounded-full bg-white/90 px-5 text-sm font-semibold text-black shadow-lg active:scale-95 disabled:opacity-50"
      >
        <DownloadIcon className="size-4" />
        {saving ? "..." : "Enregistrer"}
      </button>
    </div>
  );
}
