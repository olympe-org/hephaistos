import { CheckIcon, LoaderIcon, XIcon } from "lucide-react";

// Header for a render phase (Download, Assembly): status icon + timer
export default function PhaseHeader({
  label,
  elapsed,
  done,
  running,
  cancelled,
}: {
  label: string;
  elapsed: string | null;
  done: boolean;
  running: boolean;
  cancelled: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {running && (
          <LoaderIcon className="size-3.5 shrink-0 animate-spin text-violet-500 dark:text-violet-400" />
        )}
        {done && <CheckIcon className="size-3.5 shrink-0 text-green-500" />}
        {cancelled && <XIcon className="size-3.5 shrink-0 text-destructive" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {elapsed !== null && (
        <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {elapsed}
        </span>
      )}
    </div>
  );
}
