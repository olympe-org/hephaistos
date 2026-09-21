import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobilePlayer from "@/pages/render-view/MobilePlayer";
import DesktopPlayer from "@/pages/render-view/DesktopPlayer";
import { errorMessage, filenameFromDisposition, saveVideo, type VideoMeta } from "@/pages/render-view/shared";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

export default function RenderView() {
  usePageMeta({ title: "Ta vidéo · Vexia", path: "/render", indexable: false });

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<VideoMeta>({ title: null, sizeBytes: null, durationSeconds: null });

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
        // Content-Length is CORS-safelisted so it's always readable;
        // Content-Disposition needs the server to expose it, so this title
        // is best-effort and simply stays null otherwise.
        const size = res.headers.get("content-length");
        const title = filenameFromDisposition(res.headers.get("content-disposition"));
        setMeta((m) => ({ ...m, title, sizeBytes: size ? Number(size) : null }));
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

  const handleVideoError = () => setError("Impossible de lire la vidéo.");

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
      onVideoError={handleVideoError}
    />
  );
}
