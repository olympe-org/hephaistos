import { useEffect, type RefObject } from "react";

// Pauses a playing <video> once the tab/app is no longer visible (screen
// locked, app switched, tab backgrounded) so it doesn't keep running unseen.
export function usePauseOnHidden(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) ref.current?.pause();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [ref]);
}
