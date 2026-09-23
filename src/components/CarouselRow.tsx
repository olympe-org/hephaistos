import type { ReactNode } from "react";

// Default sizing for a CarouselRow child below 1024px: capped below full
// width so the next card peeks in, full width again once the row becomes a
// plain grid at 1024px+.
export const CAROUSEL_ITEM =
  "w-[70vw] max-w-70 shrink-0 snap-start lg:w-auto lg:max-w-none lg:shrink";

// Swipeable row below 1024px — peeking cards bled to the screen edge (pl-6
// is asymmetric on purpose, see each caller) — a plain grid at 1024px+.
// Shared by the metric/account card sections on /user and /admin.
export default function CarouselRow({
  gridClassName,
  children,
}: {
  // lg:grid-cols-* (plus any wider tier) — the only thing that differs
  // between sections, since column count varies (2, 3 or 4 cards).
  gridClassName: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-6 pb-1 pl-6 lg:grid lg:snap-none lg:overflow-visible lg:pb-0 lg:pl-0 ${gridClassName}`}
    >
      {children}
      <div
        aria-hidden
        className="order-last w-3 shrink-0 lg:hidden"
      />
    </div>
  );
}
