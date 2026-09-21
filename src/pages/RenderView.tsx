import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobilePlayer from "@/pages/render-view/MobilePlayer";
import DesktopPlayer from "@/pages/render-view/DesktopPlayer";
import { errorMessage, saveVideo, type VideoMeta } from "@/pages/render-view/shared";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

export default function RenderView() {
  usePageMeta({ title: "Rendu vidéo · Vexia", path: "/render", indexable: false });

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const downloadUrl =
    jobId && token ? `${BASE_URL}/jobs/${jobId}/download?token=${token}` : null;

  // Set only once the link has been checked — the <video> tag then streams
  // it progressively itself, no need to wait for (or hold in memory) the
  // whole file just to display it.
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // The initial fetch only catches a broken token/link — it doesn't guarantee
  // the video itself will actually play, so the polished UI stays hidden
  // behind the loader until the <video> element confirms it loaded a frame.
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<VideoMeta>({ title: null, sizeBytes: null, durationSeconds: null });

  const loading = !error && !videoReady;

  useEffect(() => {
    if (!downloadUrl) {
      setError("Lien invalide.");
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
        const size = res.headers.get("content-length");
        const rawTitle = res.headers.get("X-Job-Title");
        const title = rawTitle ? decodeURIComponent(rawTitle) : null;
        setMeta((m) => ({ ...m, title, sizeBytes: size ? Number(size) : null }));
        controller.abort();
        setVideoUrl(downloadUrl);
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Impossible de charger la vidéo.");
        }
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

  const handleVideoError = () => setError("Impossible de lire la vidéo.");
  const handleVideoReady = () => setVideoReady(true);

  if (isDesktop) {
    return (
      <DesktopPlayer
        loading={loading}
        error={error}
        videoUrl={videoUrl}
        meta={meta}
        saving={saving}
        onSave={handleSave}
        onVideoLoadedMetadata={(durationSeconds) => setMeta((m) => ({ ...m, durationSeconds }))}
        onVideoReady={handleVideoReady}
        onVideoError={handleVideoError}
      />
    );
  }

  return (
    <MobilePlayer
      loading={loading}
      error={error}
      videoUrl={videoUrl}
      saving={saving}
      onSave={handleSave}
      onVideoReady={handleVideoReady}
      onVideoError={handleVideoError}
    />
  );
}
