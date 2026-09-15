import { useEffect, useRef, useState } from "react";

// Freezes an image on its current frame by replacing it with a canvas capture
// (useful to freeze an animated gif/webp without actually stopping it).
function freezeImage(img: HTMLImageElement, frozen: Map<HTMLImageElement, string>) {
  if (img.src.startsWith("data:")) return;
  const liveSrc = img.src;

  const capture = () => {
    if (img.src !== liveSrc) return; // the source changed while it was loading
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
    frozen.set(img, liveSrc);
    try {
      img.src = canvas.toDataURL("image/png");
    } catch {
      // cross-origin image: can't be captured, leave it animated
    }
  };

  if (img.complete && img.naturalWidth > 0) capture();
  else img.addEventListener("load", capture, { once: true });
}

// Lets you pause the animated preview (TemplatePreview) by freezing every
// <img> on its current frame, and resume by remounting it fresh.
export function usePausablePreview() {
  const [paused, setPaused] = useState(false);
  // Incremented to force the preview to remount when resuming
  const [resetKey, setResetKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const frozenSrcs = useRef<Map<HTMLImageElement, string>>(new Map());

  const toggle = () => {
    if (!paused) {
      containerRef.current
        ?.querySelectorAll("img")
        .forEach((img) => freezeImage(img, frozenSrcs.current));
    } else {
      frozenSrcs.current.clear();
      setResetKey((k) => k + 1);
    }
    setPaused((p) => !p);
  };

  // While paused, also freeze images that get added or whose source changes
  // (the preview keeps receiving store updates in the background)
  useEffect(() => {
    if (!paused || !containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "src") {
          const img = mutation.target as HTMLImageElement;
          if (!img.src.startsWith("data:")) freezeImage(img, frozenSrcs.current);
        }
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLImageElement) freezeImage(node, frozenSrcs.current);
            else if (node instanceof Element)
              node
                .querySelectorAll("img")
                .forEach((img) => freezeImage(img, frozenSrcs.current));
          });
          mutation.removedNodes.forEach((node) => {
            if (node instanceof HTMLImageElement) frozenSrcs.current.delete(node);
            else if (node instanceof Element)
              node
                .querySelectorAll("img")
                .forEach((img) => frozenSrcs.current.delete(img));
          });
        }
      }
    });
    observer.observe(containerRef.current, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });
    return () => observer.disconnect();
  }, [paused]);

  return { containerRef, paused, resetKey, toggle };
}
