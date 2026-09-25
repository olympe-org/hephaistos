// Plain forced download — what "Télécharger" always does on a real laptop,
// even on browsers that would otherwise offer a native share sheet there too.
export function downloadBlob(blob: Blob, filename = "video.mp4") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Mobile: native share sheet ("Save to Photos") instead of a generic file
// download, which just lands in a Files/Downloads app with no easy way back
// into the camera roll.
export async function saveVideo(blob: Blob, filename = "video.mp4") {
  const file = new File([blob], filename, { type: "video/mp4" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Vidéo" });
    return;
  }

  downloadBlob(blob, filename);
}

// Same laptop/mobile split as RenderView's own save button — a real laptop
// always gets a plain, forced download (some desktop browsers, e.g. Edge on
// Windows, also expose navigator.share, which would otherwise pop the OS
// share sheet instead of just saving the file); anything narrower saves to
// the device's photo library instead.
export function isLaptopViewport(): boolean {
  return window.matchMedia("(min-width: 900px)").matches;
}
