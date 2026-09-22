import type { ReactNode } from "react";

// Header for app pages: eyebrow + title on the left, optional action on the right
export default function PageHeader({
  eyebrow,
  title,
  badge,
  action,
}: {
  eyebrow: string;
  title: string;
  // Element shown next to the title (e.g. the Admin badge)
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-end justify-between gap-4 pt-2 pb-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">{eyebrow}</span>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
            {title}
          </h1>
          {badge}
        </div>
      </div>
      {action}
    </div>
  );
}
