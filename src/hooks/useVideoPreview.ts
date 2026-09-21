import { useEffect, useState } from "react";
import { toast } from "sonner";
import { directVideoUrl, getShareLink } from "@/utils/api/render";

interface LoadedVideo {
  jobId: string;
  // null if loading failed
  url: string | null;
}

// Loads a direct, streamable URL for the selected render (a short-lived share
// link from the backend) so the <video> tag can play it progressively —
// no more downloading the whole file into a Blob before showing anything.
export function useVideoPreview(jobId: string | null) {
  // We keep the video together with its render's id: it's only shown if the
  // selection hasn't changed in the meantime (no need to reset it in the effect)
  const [loaded, setLoaded] = useState<LoadedVideo | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    getShareLink(jobId)
      .then(({ url }) => {
        if (!cancelled) setLoaded({ jobId, url: directVideoUrl(jobId, url) });
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Impossible de charger la vidéo.");
        setLoaded({ jobId, url: null });
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const current = loaded && loaded.jobId === jobId ? loaded : null;

  return {
    videoUrl: current?.url ?? null,
    loading: jobId !== null && current === null,
  };
}
