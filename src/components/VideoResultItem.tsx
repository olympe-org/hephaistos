export interface VideoResult {
  type: string;
  videoId: string;
  title: string;
  author: string;
  authorVerified: boolean;
  lengthSeconds: number;
  viewCountText: string;
  publishedText: string;
  videoThumbnails: { url: string; quality: string }[];
}

function thumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoResultItem({
  video,
  selected,
  onSelect,
}: {
  video: VideoResult;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      tabIndex={-1}
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-xl p-2 text-left transition-colors ${
        selected
          ? "bg-muted ring-1 ring-foreground/20"
          : "hover:bg-muted/60"
      }`}
    >
      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={thumbnail(video.videoId)}
          alt={video.title}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 font-mono text-[10px] text-white">
          {formatDuration(video.lengthSeconds)}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {video.author}
          {video.authorVerified && <span className="ml-1">✓</span>}
        </p>
        <p className="text-xs text-muted-foreground">{video.viewCountText}</p>
      </div>
    </button>
  );
}
