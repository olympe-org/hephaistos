import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { setAllDurations } from "@/store/createVideoSlice";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import VideoSearchPanel from "./VideoSearchPanel";
import VideoSelectionFields from "./VideoSelectionFields";
import { type VideoResult } from "./VideoResultItem";

// ─── YT IFrame API ────────────────────────────────────────────────────────────

interface YTPlayer {
  getCurrentTime(): number;
  destroy(): void;
  pauseVideo(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | HTMLIFrameElement,
        opts: object,
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYTScript() {
  if (document.getElementById("yt-iframe-api")) return;
  const s = document.createElement("script");
  s.id = "yt-iframe-api";
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

const INVIDIOUS_URL = import.meta.env.VITE_INVIDIOUS_URL ?? "https://inv.nadeko.net";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoSelection {
  url: string;
  start: string;
  duration: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function secondsToTimecode(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function stripStreams(title: string): string {
  return title.replace(/\s*\(\d+(?:[.,]\d+)?b\)\s*$/i, "").trim();
}

function extractVideoId(url: string): string | null {
  try {
    return new URL(url).searchParams.get("v");
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoPickerDialog({
  open,
  onOpenChange,
  initial,
  initialTitle = "",
  autoSearch = false,
  onAutoSearchDone,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: VideoSelection;
  initialTitle?: string;
  autoSearch?: boolean;
  onAutoSearchDone?: () => void;
  onConfirm: (selection: VideoSelection) => void;
}) {
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState(() => {
    const base = stripStreams(initialTitle);
    return base ? `${base} official clip` : "";
  });

  const [syncedTitle, setSyncedTitle] = useState(initialTitle);
  if (initialTitle !== syncedTitle) {
    setSyncedTitle(initialTitle);
    const base = stripStreams(initialTitle);
    setQuery(base ? `${base} official clip` : "");
  }

  const [results, setResults] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<VideoResult | null>(null);

  const [url, setUrl] = useState(initial.url);
  const [start, setStart] = useState(initial.start);
  const [duration, setDuration] = useState(initial.duration);

  const [syncTimecode, setSyncTimecode] = useState(true);
  const syncTimecodeRef = useRef(true);

  const playerRef = useRef<YTPlayer | null>(null);
  const pausePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelInitRef = useRef<(() => void) | null>(null);

  const activeVideoId = selected?.videoId ?? extractVideoId(initial.url);

  // ── YT Player ──────────────────────────────────────────────────────────────

  const handleContainer = useCallback(
    (node: HTMLDivElement | null) => {
      cancelInitRef.current?.();
      cancelInitRef.current = null;
      if (pausePollRef.current) {
        clearInterval(pausePollRef.current);
        pausePollRef.current = null;
      }
      playerRef.current?.destroy();
      playerRef.current = null;

      if (!node || !activeVideoId) return;

      let cancelled = false;
      cancelInitRef.current = () => {
        cancelled = true;
      };

      const clearPausePoll = () => {
        if (pausePollRef.current) {
          clearInterval(pausePollRef.current);
          pausePollRef.current = null;
        }
      };

      const initPlayer = () => {
        if (cancelled || !window.YT?.Player) return;
        node.innerHTML = "";
        playerRef.current = new window.YT.Player(node, {
          videoId: activeVideoId,
          width: "100%",
          height: "100%",
          playerVars: { rel: 0, enablejsapi: 1 },
          events: {
            onStateChange: (e: { data: number }) => {
              if (e.data === 3 && playerRef.current) {
                clearPausePoll();
                const t = secondsToTimecode(
                  Math.floor(playerRef.current.getCurrentTime()),
                );
                if (syncTimecodeRef.current) setStart(t);
              }
              if (e.data === 2) {
                clearPausePoll();
                let lastTime = playerRef.current?.getCurrentTime() ?? 0;
                pausePollRef.current = setInterval(() => {
                  const current =
                    playerRef.current?.getCurrentTime() ?? lastTime;
                  if (Math.abs(current - lastTime) > 0.5) {
                    const t = secondsToTimecode(Math.floor(current));
                    if (syncTimecodeRef.current) setStart(t);
                  }
                  lastTime = current;
                }, 150);
              } else {
                clearPausePoll();
              }
            },
          },
        });
      };

      loadYTScript();
      if (window.YT?.Player) initPlayer();
      else {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          initPlayer();
        };
      }
    },
    [activeVideoId],
  );

  useEffect(() => {
    if (open) {
      setUrl(initial.url);
      setStart(initial.start);
      setDuration(initial.duration);
    } else {
      playerRef.current?.pauseVideo();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Search ─────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${INVIDIOUS_URL}/api/v1/search?q=${encodeURIComponent(query)}&type=video&region=US`,
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data: VideoResult[] = await res.json();
      setResults(data.filter((r) => r.type === "video").slice(0, 10));
    } catch {
      setError("Recherche indisponible. Réessaie plus tard.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && autoSearch && query.trim()) {
      onAutoSearchDone?.();
      setTimeout(handleSearch, 0);
    }
  }, [open, autoSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (video: VideoResult) => {
    setSelected(video);
    setUrl(`https://www.youtube.com/watch?v=${video.videoId}`);
  };

  const handleConfirm = () => {
    onConfirm({ url, start, duration });
    onOpenChange(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[72dvw]">
        <div className="flex shrink-0 flex-col gap-1 border-b px-6 py-5 pr-16">
          <h2 className="text-lg font-semibold tracking-tight">
            Choisir une vidéo
          </h2>
          <p className="text-sm text-muted-foreground">
            Cherche sur YouTube ou colle une URL, puis règle le début et la
            durée de l'extrait.
          </p>
        </div>

        <div className="grid grid-cols-[2fr_3fr] h-[80vh] min-h-0 overflow-hidden">
          <VideoSearchPanel
            query={query}
            setQuery={setQuery}
            results={results}
            loading={loading}
            error={error}
            selectedId={selected?.videoId ?? null}
            onSearch={handleSearch}
            onSelect={handleSelect}
          />

          <div className="flex min-h-0 flex-col gap-3 p-5">
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
              {activeVideoId ? (
                <div className="aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-black">
                  <div
                    ref={handleContainer}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Sélectionne une vidéo ou colle une URL
                  </p>
                </div>
              )}

              <VideoSelectionFields
                url={url}
                onUrlChange={setUrl}
                start={start}
                onStartChange={setStart}
                duration={duration}
                onDurationChange={setDuration}
                syncTimecode={syncTimecode}
                onToggleSync={() => {
                  const next = !syncTimecode;
                  setSyncTimecode(next);
                  syncTimecodeRef.current = next;
                }}
                onApplyAllDurations={() => {
                  dispatch(setAllDurations(duration));
                  toast.success(
                    `Durée de ${duration}s appliquée à tous les extraits`,
                  );
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-full px-4 text-sm"
                tabIndex={-1}
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-full px-4 text-sm"
                onClick={handleConfirm}
                disabled={!url}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
