import type { AppDispatch } from "@/store";
import { updateJob } from "@/store/renderSlice";
import type { RenderJob } from "@/store/renderSlice";
import type { CreateVideoState } from "@/store/createVideoSlice";
import { fetchAuth } from "./http";

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

// ─── Body builder ─────────────────────────────────────────────────────────────

export function buildRenderBody(state: CreateVideoState): object {
  const f = state.templateFeatures;
  return {
    template: state.templateValue,
    background: state.background,
    teaserTop: state.teaserTop,
    title: state.globalTitle,
    // Distinct from `title` (shown in the video); omitted when empty, the
    // backend generates its own name.
    ...(state.jobName.trim() && { job_name: state.jobName.trim() }),
    ...(f.includes("videoMargin") && { videoMargin: state.videoMargin }),
    ...(f.includes("spacing") && { spacing: state.spacing }),
    ...(f.includes("smoothTransition") && {
      smoothTransition: state.smoothTransition,
    }),
    ...(f.includes("watermark") && { watermark: state.watermark }),
    ...(f.includes("highlightActive") && {
      highlightActive: state.highlightActive,
    }),
    data: state.clips,
  };
}

// ─── POST /jobs/render ────────────────────────────────────────────────────────

export async function startRender(body: object): Promise<RenderJob> {
  const res = await fetchAuth(`${BASE_URL}/jobs/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Render failed"), {
      status: res.status,
      detail: err,
    });
  }

  return res.json();
}

// ─── GET /jobs/{job_id}/stream ───────────────────────────────────────────────
// fetch + ReadableStream so we can send the Authorization header

// A job purged from server memory mid-stream (restart, cleanup once terminal)
// reports just {"error": "..."} with no status — unlike every other event,
// which always has one. It doesn't mean the render failed, just that we lost
// its live updates, so it's surfaced via `message` rather than `status`.
const TRACKING_LOST_MESSAGE =
  "Connexion au suivi perdue. Tu recevras un e-mail dès que ta vidéo sera prête.";

function isTrackingLostEvent(data: Partial<RenderJob>): boolean {
  return "error" in data && data.status === undefined;
}

export function subscribeToJob(jobId: string, dispatch: AppDispatch): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetchAuth(`${BASE_URL}/jobs/${jobId}/stream`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (typeof err?.detail === "string" ? err.detail : err?.detail?.message) ?? err?.message ?? "Job introuvable";
        dispatch(updateJob({ status: "failed", error: msg }));
        return;
      }
      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data: Partial<RenderJob> = JSON.parse(line.slice(6));
            if (isTrackingLostEvent(data)) {
              dispatch(updateJob({ message: TRACKING_LOST_MESSAGE }));
              controller.abort();
              return;
            }
            dispatch(updateJob(data));
            if (data.status === "done" || data.status === "failed" || data.status === "cancelled") {
              controller.abort();
              return;
            }
          } catch {
            // non-JSON SSE line (e.g. keep-alive comment)
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") console.error("SSE error", err);
    }
  })();

  return () => controller.abort();
}

// ─── GET /jobs/{job_id}/stream (callback) ────────────────────────────────────

export function subscribeToJobCallback(
  jobId: string,
  onUpdate: (data: Partial<RenderJob>) => void,
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetchAuth(`${BASE_URL}/jobs/${jobId}/stream`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (typeof err?.detail === "string" ? err.detail : err?.detail?.message) ?? err?.message ?? "Job introuvable";
        onUpdate({ status: "failed", error: msg });
        return;
      }
      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as Partial<RenderJob>;
            if (isTrackingLostEvent(data)) {
              onUpdate({ message: TRACKING_LOST_MESSAGE });
              controller.abort();
              return;
            }
            onUpdate(data);
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") { /* ignore */ }
    }
  })();

  return () => controller.abort();
}

// ─── DELETE /jobs/{job_id} ───────────────────────────────────────────────────

export async function cancelRender(jobId: string): Promise<void> {
  const res = await fetchAuth(`${BASE_URL}/jobs/${jobId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Cancel failed"), {
      status: res.status,
      detail: err,
    });
  }
}

// ─── GET /jobs/{job_id}/download ─────────────────────────────────────────────

async function fetchVideoBlob(jobId: string): Promise<Blob> {
  const res = await fetchAuth(`${BASE_URL}/jobs/${jobId}/download`);
  if (!res.ok) throw new Error("Video not available");
  if (!res.body) return res.blob();

  const reader = res.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return new Blob(chunks, { type: "video/mp4" });
}

// Strip characters invalid in filenames on Windows/macOS
function sanitizeFilename(name: string): string {
  return name.trim().replace(/[\\/:*?"<>|]+/g, "-").slice(0, 100);
}

export async function downloadVideo(jobId: string, title?: string): Promise<void> {
  const blob = await fetchVideoBlob(jobId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const name = title && sanitizeFilename(title);
  a.download = `${name || jobId}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── GET /jobs/{job_id}/share-link ────────────────────────────────────────────

export interface ShareLink {
  // A vexia.studio page (short-lived token, ~48h) meant to be opened by a
  // person — QR code, e-mail, copy-link button. Not a playable video URL:
  // for a <video src>, use directVideoUrl() instead.
  url: string;
  expires_at: string;
}

export async function getShareLink(jobId: string): Promise<ShareLink> {
  const res = await fetchAuth(`${BASE_URL}/jobs/${jobId}/share-link`);
  if (!res.ok) throw new Error("Failed to get share link");
  return res.json();
}

// Builds the direct, playable video URL for in-app previews (<video src>),
// by lifting the token out of a share link's vexia.studio page URL.
export function directVideoUrl(jobId: string, shareUrl: string): string {
  const token = new URL(shareUrl).searchParams.get("token") ?? "";
  return `${BASE_URL}/jobs/${jobId}/download?token=${token}`;
}

// ─── Public metrics ───────────────────────────────────────────────────────────

export interface PublicMetrics {
  total_videos_created: number;
  total_duration_seconds: number;
  total_clips_used: number;
  money_earned: number;
}

export async function getPublicMetrics(): Promise<PublicMetrics> {
  const res = await fetch(`${BASE_URL}/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}
