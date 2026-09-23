import { useEffect, useRef, useState } from "react";

// Progressively coarser readings of a duration — full precision first, then
// each smaller unit dropped in turn. The last one (down to a single unit)
// gets a "+" prefix, since real precision has been lost by then.
// 5434 -> ["1h 30mins 34s", "1h 30mins", "+1h"]
// 1834 -> ["30mins 34s", "+30mins"]
function durationVariants(totalSeconds: number): string[] {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}min${m > 1 ? "s" : ""}`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.map((_, i) => {
    const keep = parts.length - i;
    const shown = parts.slice(0, keep).join(" ");
    return keep === 1 && parts.length > 1 ? `+${shown}` : shown;
  });
}

// Renders a duration that drops precision (seconds, then minutes) instead of
// overflowing once its container gets too narrow to fit — measured against
// the container's real, current width rather than a fixed breakpoint.
export default function FittedDuration({ seconds }: { seconds: number }) {
  const variants = durationVariants(seconds);
  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [chosen, setChosen] = useState(variants.length - 1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recompute = () => {
      const available = container.clientWidth;
      let best = variants.length - 1;
      for (let i = 0; i < variants.length; i++) {
        const el = measureRefs.current[i];
        if (el && el.scrollWidth <= available) {
          best = i;
          break;
        }
      }
      setChosen(best);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => observer.disconnect();
  }, [variants]);

  return (
    <span
      ref={containerRef}
      className="relative inline-block w-full align-bottom"
    >
      {/* Invisible, absolutely positioned — measured but never shown */}
      {variants.map((text, i) => (
        <span
          key={text}
          ref={(el) => {
            measureRefs.current[i] = el;
          }}
          aria-hidden="true"
          className="invisible absolute top-0 left-0 whitespace-nowrap"
        >
          {text}
        </span>
      ))}
      <span className="whitespace-nowrap">{variants[chosen]}</span>
    </span>
  );
}
