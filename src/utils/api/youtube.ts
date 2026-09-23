import type { VideoResult } from "@/components/VideoResultItem";
import { fetchAuth } from "./http";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";
const INVIDIOUS_URL =
  import.meta.env.VITE_INVIDIOUS_URL ?? "https://invidious.f5.si";

// yt-dlp-backed search — requires auth, used instead of the public Invidious
// instance once the user is logged in (no CORS/instance-uptime dependency).
// Mirrors Invidious's own response shape (see VideoResult) so the frontend
// parses either source identically.
export async function searchYoutube(
  query: string,
  limit = 10,
): Promise<VideoResult[]> {
  const res = await fetchAuth(
    `${BASE_URL}/youtube/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// Public Invidious instance — used for guests, since it needs no auth. Can
// go down or start rejecting requests at any time (see VITE_INVIDIOUS_URL to
// swap instances without a redeploy).
export async function searchInvidious(query: string): Promise<VideoResult[]> {
  const res = await fetch(
    `${INVIDIOUS_URL}/api/v1/search?q=${encodeURIComponent(query)}&type=video&region=US`,
  );
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
