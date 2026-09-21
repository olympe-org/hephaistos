// FastAPI errors come back as { detail: "message" } or { detail: { message } }
export function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return fallback;
}

// Plain forced download — what "Télécharger" always does on a real laptop,
// even on browsers that would otherwise offer a native share sheet there too.
export function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function saveVideo(blob: Blob) {
  const file = new File([blob], "video.mp4", { type: "video/mp4" });

  // iOS Safari + modern Android Chrome: native share sheet → "Save to Photos"
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Vidéo" });
    return;
  }

  downloadBlob(blob);
}

export interface VideoMeta {
  title: string | null;
  sizeBytes: number | null;
  durationSeconds: number | null;
}
