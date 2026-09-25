// FastAPI errors come back as { detail: "message" } or { detail: { message } }
export function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return fallback;
}

export { downloadBlob, saveVideo } from "@/lib/videoDownload";

export interface VideoMeta {
  title: string | null;
  sizeBytes: number | null;
  durationSeconds: number | null;
}
