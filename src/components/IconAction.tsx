import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export default function IconAction({
  danger = false,
  className,
  ...props
}: ComponentProps<"button"> & { danger?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
        danger
          ? "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          : "hover:border-foreground/30 hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
