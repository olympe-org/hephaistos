import { useEffect, useRef, useState } from "react";
import type { ClipRenderData, RenderJob, RenderStatus } from "@/store/renderSlice";

const RUNNING_STATUSES: RenderStatus[] = ["pending", "downloading", "processing"];

export interface ClipTiming {
  start: number;
  end?: number;
}

interface Timestamps {
  downloadingAt: number | null;
  processingAt: number | null;
  doneAt: number | null;
  cancelledAt: number | null;
}

const NO_TIMESTAMPS: Timestamps = {
  downloadingAt: null,
  processingAt: null,
  doneAt: null,
  cancelledAt: null,
};

// Timestamps each stage of a render (statuses + each clip's download) to
// display a timer per phase. Timestamps live in state (never in a ref)
// because the component reads them during render — only the "previous
// values" used to detect a change stay in refs, and are only read inside
// effects, never during render.
export function useJobTimeline(job: RenderJob | null) {
  const [timestamps, setTimestamps] = useState<Timestamps>(NO_TIMESTAMPS);
  const [clipTimers, setClipTimers] = useState<Record<string, ClipTiming>>({});
  const prevStatusRef = useRef<RenderStatus | null>(null);
  const prevClipsRef = useRef<ClipRenderData[] | undefined>(undefined);

  // Timestamps each status transition (once per status). The update is
  // deferred by a tick (same pattern as Layout.tsx's banner) rather than
  // calling setState synchronously in the effect body.
  useEffect(() => {
    if (!job || job.status === prevStatusRef.current) return;
    const now = Date.now();
    const status = job.status;
    prevStatusRef.current = status;

    const id = setTimeout(() => {
      setTimestamps((prev) => ({
        downloadingAt: status === "downloading" ? (prev.downloadingAt ?? now) : prev.downloadingAt,
        processingAt: status === "processing" ? (prev.processingAt ?? now) : prev.processingAt,
        doneAt: status === "done" ? (prev.doneAt ?? now) : prev.doneAt,
        cancelledAt: status === "cancelled" ? (prev.cancelledAt ?? now) : prev.cancelledAt,
      }));
    }, 0);
    return () => clearTimeout(id);
  }, [job]);

  // Timestamps the start and end of each clip's download
  useEffect(() => {
    if (!job?.clips || job.clips === prevClipsRef.current) return;
    const now = Date.now();
    const clips = job.clips;
    const prevClips = prevClipsRef.current;
    prevClipsRef.current = clips;

    setClipTimers((prev) => {
      let next = prev;
      for (const clip of clips) {
        const prevClip = prevClips?.find((c) => c.id === clip.id);
        if (
          clip.status === "downloading" &&
          prevClip?.status !== "downloading" &&
          !next[clip.id]
        ) {
          next = { ...next, [clip.id]: { start: now } };
        }
        if (clip.status === "done" && prevClip?.status === "downloading") {
          const timing = next[clip.id];
          if (timing && !timing.end) next = { ...next, [clip.id]: { ...timing, end: now } };
        }
      }
      return next;
    });
  }, [job?.clips]);

  // Rolling "now", refreshed every second while the render is running — lets
  // us display timers that tick without ever reading the clock during render.
  // Initialized once, when the hook is created (lazy initializer).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!job || !RUNNING_STATUSES.includes(job.status)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
    // Only status matters here — depending on the whole job object would tear
    // down and recreate the interval on every SSE tick (every ~0.5s), which
    // is faster than the interval's own delay, so it would never actually fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status]);

  // The overall elapsed timer is anchored to the backend's own timestamp, not
  // to whenever the frontend happened to receive the first SSE event — that
  // moment can lag behind the real job creation (connection latency,
  // reconnects…), and created_at is the only value the server actually
  // vouches for. Parsing a fixed ISO string is pure (same input, same
  // output), unlike Date.now(), so this is safe to compute during render.
  const startedAt = job ? new Date(job.created_at).getTime() : null;

  const frozenAt = timestamps.cancelledAt ?? timestamps.doneAt;

  return {
    clipTimers,
    downloadingAt: timestamps.downloadingAt,
    processingAt: timestamps.processingAt,
    doneAt: timestamps.doneAt,
    totalElapsed: startedAt ? (frozenAt ?? now) - startedAt : null,
    downloadElapsed: timestamps.downloadingAt
      ? (timestamps.processingAt ?? frozenAt ?? now) - timestamps.downloadingAt
      : null,
    processElapsed: timestamps.processingAt ? (frozenAt ?? now) - timestamps.processingAt : null,
    // For displaying the elapsed time of each clip currently downloading
    now,
  };
}
