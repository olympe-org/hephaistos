// Display formats shared by the user / admin pages

// 1536 → "1.5 Ko", 2.5e9 → "2.5 Go"
export function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} Go`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} Mo`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} Ko`;
  return `${bytes.toFixed(1)} o`;
}

// 754 → "12min 34s", 45 → "45s"
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}min${m > 1 ? "s" : ""}${s > 0 ? ` ${s}s` : ""}`;
  return `${seconds}s`;
}
