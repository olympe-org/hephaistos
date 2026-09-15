import type { ElementType } from "react";

// Key-figure card: icon + label, value, optional sub-value and progress bar
export default function MetricCard({
  Icon,
  label,
  value,
  sub,
  percent,
}: {
  Icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  percent?: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-3xl font-semibold leading-none tracking-[-0.03em] whitespace-nowrap tabular-nums">
          {value}
        </span>
        {sub && (
          <span className="text-xs whitespace-nowrap tabular-nums text-muted-foreground">
            {sub}
          </span>
        )}
      </div>
      {percent !== undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-500"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Placeholder cards while loading
export function MetricSkeletons({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-27 animate-pulse rounded-2xl border border-border bg-muted/30"
        />
      ))}
    </>
  );
}
