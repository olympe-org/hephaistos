// 75_000 → "1:15". Clamped to 0 — a clip's start timestamp and the ticking
// "now" clock update on separate schedules, so their difference can briefly
// go negative right as a clip starts.
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
