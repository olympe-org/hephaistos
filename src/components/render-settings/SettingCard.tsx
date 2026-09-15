import type { ReactNode } from "react";
import { PANEL } from "@/lib/tokens";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

// One setting = one card: title + description at the top (a switch on the
// right for on/off settings), then the fields below. Same surface as clips.
export function SettingCard({
  label,
  hint,
  toggle,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  toggle?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-4 ${PANEL} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold">{label}</span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
        {toggle}
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// Numeric field with a unit shown on the right (px, s…)
export function UnitInput({
  unit,
  ...props
}: React.ComponentProps<typeof Input> & { unit: string }) {
  return (
    <div className="relative w-full">
      <Input
        {...props}
        className="pr-9 tabular-nums"
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
