import { lazy, type ComponentType } from "react";

export const CHUNK_RELOAD_FLAG = "vx-chunk-reload";

// Vite hashes each chunk's filename per build. If a new version deployed
// while this tab was already open, an old page's chunk no longer exists on
// the server — the import 404s, and since the host falls back to index.html
// for unknown paths, the browser sees an HTML response where it expected a
// JS module (the "Expected a JavaScript module" / "Failed to fetch
// dynamically imported module" errors). A single reload fetches the current
// build's real references and fixes it; the flag stops a genuine, unrelated
// error from reloading forever.
export function lazyWithReload<T extends { default: ComponentType<unknown> }>(
  factory: () => Promise<T>,
) {
  return lazy(() =>
    factory().catch((err: unknown) => {
      if (!sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
        sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
        window.location.reload();
        // The reload takes over before a real component is ever needed
        return new Promise<T>(() => {});
      }
      throw err;
    }),
  );
}
