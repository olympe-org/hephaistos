import { useEffect, useRef, useState } from "react";
import type { ClipRenderData, RenderJob, RenderStatus } from "@/store/renderSlice";

const RUNNING_STATUSES: RenderStatus[] = ["pending", "downloading", "processing"];

export interface ClipTiming {
  start: number;
  end?: number;
}

interface Timestamps {
  startedAt: number | null;
  downloadingAt: number | null;
  processingAt: number | null;
  doneAt: number | null;
  cancelledAt: number | null;
}

const NO_TIMESTAMPS: Timestamps = {
  startedAt: null,
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

  // Timestamps each status transition (once per status)
  useEffect(() => {
    if (!job || job.status === prevStatusRef.current) return;
    const now = Date.now();
    const isFirstStatus = prevStatusRef.current === null;
    prevStatusRef.current = job.status;

    setTimestamps((prev) => ({
      startedAt: isFirstStatus ? now : prev.startedAt,
      downloadingAt: job.status === "downloading" ? (prev.downloadingAt ?? now) : prev.downloadingAt,
      processingAt: job.status === "processing" ? (prev.processingAt ?? now) : prev.processingAt,
      doneAt: job.status === "done" ? (prev.doneAt ?? now) : prev.doneAt,
      cancelledAt: job.status === "cancelled" ? (prev.cancelledAt ?? now) : prev.cancelledAt,
    }));
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
  }, [job]);

  const frozenAt = timestamps.cancelledAt ?? timestamps.doneAt;

  return {
    clipTimers,
    downloadingAt: timestamps.downloadingAt,
    processingAt: timestamps.processingAt,
    doneAt: timestamps.doneAt,
    totalElapsed: timestamps.startedAt ? (frozenAt ?? now) - timestamps.startedAt : null,
    downloadElapsed: timestamps.downloadingAt
      ? (timestamps.processingAt ?? frozenAt ?? now) - timestamps.downloadingAt
      : null,
    processElapsed: timestamps.processingAt ? (frozenAt ?? now) - timestamps.processingAt : null,
    // For displaying the elapsed time of each clip currently downloading
    now,
  };
}
