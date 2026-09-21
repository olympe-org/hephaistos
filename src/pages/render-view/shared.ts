// FastAPI errors come back as { detail: "message" } or { detail: { message } }
export function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return fallback;
}

export async function saveVideo(blob: Blob) {
  const file = new File([blob], "video.mp4", { type: "video/mp4" });

  // iOS Safari + modern Android Chrome: native share sheet → "Save to Photos"
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Vidéo" });
    return;
  }

  // Fallback: classic download link (Android Chrome, desktop)
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Best-effort: only works if the server exposes Content-Disposition via CORS.
// Falls back gracefully (null) everywhere else — never blocks the page.
export function filenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).replace(/\.mp4$/i, "");
  } catch {
    return match[1].replace(/\.mp4$/i, "");
  }
}

export interface VideoMeta {
  title: string | null;
  sizeBytes: number | null;
  durationSeconds: number | null;
}
