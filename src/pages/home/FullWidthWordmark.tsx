import { useLayoutEffect, useRef, useState } from "react";

// Reference font-size used only to measure the text's natural (unscaled)
// width — the actual displayed size comes entirely from the CSS `scale()`
// applied below, so this value never shows up on screen.
const BASE_FONT_SIZE_PX = 300;

// Stretches `text` so it always spans exactly the full width of its
// container, whatever the word and the viewport — the same effect as
// Pika's giant footer wordmark. A fixed vw-based font-size can't do this:
// it would need a different ratio for every word length. Instead we render
// the text once at a large reference size, measure it, and scale it down
// (uniformly, so it stays undistorted) to fit — recomputed on every resize.
export default function FullWidthWordmark({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  // Rendered as invisible (scale 0) until the first measurement lands, to
  // avoid a one-frame flash of the oversized, unscaled reference text.
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;

    let cancelled = false;

    // scrollWidth/scrollHeight always reflect the untransformed layout size,
    // regardless of any CSS `transform: scale()` already applied — so this
    // stays correct across recomputations, no need to reset the scale first.
    const recompute = () => {
      if (cancelled) return;
      const ratio = container.clientWidth / span.scrollWidth;
      setScale(ratio);
      // The scaled text's height, so the container doesn't collapse to the
      // (huge) unscaled line-height nor clip the (smaller) scaled text.
      container.style.height = `${span.scrollHeight * ratio}px`;
    };

    recompute();

    // The heading font (Geist, self-hosted) loads asynchronously. This first
    // measurement can land before it's ready, using the fallback font's
    // (narrower) metrics — the resulting scale then overshoots once the real,
    // wider font swaps in, making the text spill past the container. Redoing
    // the measurement once every font finishes loading corrects that.
    document.fonts?.ready.then(recompute);

    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
    >
      <span
        ref={textRef}
        aria-hidden="true"
        className="inline-block leading-[0.8] font-black tracking-[-0.04em] text-foreground uppercase whitespace-nowrap select-none"
        style={{
          fontSize: BASE_FONT_SIZE_PX,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {text}
      </span>
    </div>
  );
}
