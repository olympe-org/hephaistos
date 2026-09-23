import type { ReactNode } from "react";

export default function SectionTitle({
  title,
  description,
  action,
  stackActionsBelow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  // Drops `action` below the title instead of squeezing it alongside once
  // the row gets tight — matches the 420px breakpoint the stats grids use
  stackActionsBelow?: boolean;
}) {
  return (
    <div
      className={
        stackActionsBelow
          ? "flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between min-[420px]:gap-4"
          : "flex items-end justify-between gap-4"
      }
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
