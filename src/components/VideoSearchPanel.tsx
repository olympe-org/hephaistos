import { LoaderIcon, SearchIcon, XIcon } from "lucide-react";
import IconAction from "./IconAction";
import { Input } from "./ui/input";
import VideoResultItem, { type VideoResult } from "./VideoResultItem";

export default function VideoSearchPanel({
  query,
  setQuery,
  results,
  loading,
  error,
  selectedId,
  onSearch,
  onSelect,
}: {
  query: string;
  setQuery: (q: string) => void;
  results: VideoResult[];
  loading: boolean;
  error: string;
  selectedId: string | null;
  onSearch: () => void;
  onSelect: (video: VideoResult) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-3 border-r p-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Rechercher sur YouTube…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label="Effacer"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
        <IconAction
          className="size-9"
          aria-label="Rechercher"
          title="Rechercher"
          onClick={onSearch}
          disabled={loading}
          tabIndex={-1}
        >
          {loading ? <LoaderIcon className="animate-spin" /> : <SearchIcon />}
        </IconAction>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
        tabIndex={-1}
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {results.map((video) => (
              <VideoResultItem
                key={video.videoId}
                video={video}
                selected={selectedId === video.videoId}
                onSelect={() => onSelect(video)}
              />
            ))}
            {results.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Aucun résultat
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
