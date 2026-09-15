import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getVideoObjectUrl } from "@/utils/api/render";

interface LoadedVideo {
  jobId: string;
  // null if loading failed
  url: string | null;
}

// Loads the selected render's video as an object URL, and releases the previous one
export function useVideoPreview(jobId: string | null) {
  // We keep the video together with its render's id: it's only shown if the
  // selection hasn't changed in the meantime (no need to reset it in the effect)
  const [loaded, setLoaded] = useState<LoadedVideo | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    getVideoObjectUrl(jobId)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setLoaded({ jobId, url });
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

  // Release the URL on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const current = loaded && loaded.jobId === jobId ? loaded : null;

  return {
    videoUrl: current?.url ?? null,
    loading: jobId !== null && current === null,
  };
}
