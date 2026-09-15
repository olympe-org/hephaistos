import { useLayoutEffect, useRef, useState } from "react";

const BASE_FONT_SIZE_PX = 300;

export default function FullWidthWordmark({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;

    const recompute = () => {
      const ratio = container.clientWidth / span.scrollWidth;
      setScale(ratio);
      container.style.height = `${span.scrollHeight * ratio}px`;
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => observer.disconnect();
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
