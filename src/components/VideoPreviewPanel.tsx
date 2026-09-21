import { useRef } from "react";
import { FilmIcon, LoaderIcon } from "lucide-react";
import { usePauseOnHidden } from "@/hooks/usePauseOnHidden";

// Right column of the user / admin pages: 9:16 player for the selected render
export default function VideoPreviewPanel({
  jobId,
  videoUrl,
  loading,
}: {
  jobId: string | null;
  videoUrl: string | null;
  loading: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  usePauseOnHidden(videoRef);

  return (
    <div className="flex h-[calc(100vh-var(--nav-h))] shrink-0 flex-col pt-2 pb-8">
      <div className="flex shrink-0 flex-col gap-1.5 pb-6">
        <span className="text-sm text-muted-foreground">Aperçu</span>
        <h2 className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
          {jobId ? "Vidéo" : "Aperçu"}
        </h2>
      </div>
      <div className="h-px shrink-0 bg-border" />
      <div className="flex flex-1 items-center justify-center pt-6">
        <div
          className="shrink-0 overflow-hidden rounded-[24px] border border-border bg-muted/30"
          style={{
            height: "calc(100vh - var(--nav-h) - 2.5rem - 120px)",
            aspectRatio: "9/16",
          }}
        >
          {jobId && loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : jobId && videoUrl ? (
            <video
              ref={videoRef}
              key={jobId}
              src={videoUrl}
              autoPlay
              loop
              playsInline
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
              <FilmIcon className="size-5 text-muted-foreground/50" />
              <p className="text-center text-sm leading-relaxed text-muted-foreground">
                Clique sur un rendu terminé
                <br />
                pour le prévisualiser
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
