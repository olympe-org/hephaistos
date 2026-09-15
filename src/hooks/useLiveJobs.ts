import { useEffect, useRef, useState } from "react";
import { TERMINAL_STATUSES } from "@/lib/jobs";
import type { RenderJob } from "@/store/renderSlice";
import { subscribeToJobCallback } from "@/utils/api/render";

// Tracks live (SSE) the in-progress renders whose ids are passed in;
// `onJobFinished` is called when one of them completes.
export function useLiveJobs(activeIds: string[], onJobFinished: () => void) {
  const [liveJobs, setLiveJobs] = useState<Record<string, Partial<RenderJob>>>(
    {},
  );
  const cleanups = useRef<Record<string, () => void>>({});

  // Stable key: the caller often recreates the array on every render
  const idsKey = activeIds.join("|");

  useEffect(() => {
    const active = new Set(activeIds);

    // Unsubscribe from renders that are no longer active
    for (const id of Object.keys(cleanups.current)) {
      if (!active.has(id)) {
        cleanups.current[id]();
        delete cleanups.current[id];
      }
    }

    // Subscribe to the new ones
    for (const id of active) {
      if (cleanups.current[id]) continue;
      cleanups.current[id] = subscribeToJobCallback(id, (data) => {
        setLiveJobs((prev) => ({
          ...prev,
          [id]: { ...(prev[id] ?? {}), ...data },
        }));
        if (data.status && TERMINAL_STATUSES.has(data.status)) {
          cleanups.current[id]?.();
          delete cleanups.current[id];
          onJobFinished();
        }
      });
    }
  }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- activeIds is represented by idsKey

  // Tear down every subscription on unmount
  useEffect(() => {
    const current = cleanups.current;
    return () => Object.values(current).forEach((fn) => fn());
  }, []);

  // Forget a render's live data (after cancellation)
  const forgetJob = (id: string) =>
    setLiveJobs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  return { liveJobs, forgetJob };
}
