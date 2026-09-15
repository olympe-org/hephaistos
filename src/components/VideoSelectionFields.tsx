import { InfoIcon } from "lucide-react";
import IconAction from "./IconAction";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function VideoSelectionFields({
  url,
  onUrlChange,
  start,
  onStartChange,
  duration,
  onDurationChange,
  syncTimecode,
  onToggleSync,
  onApplyAllDurations,
}: {
  url: string;
  onUrlChange: (url: string) => void;
  start: string;
  onStartChange: (start: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  syncTimecode: boolean;
  onToggleSync: () => void;
  onApplyAllDurations: () => void;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr_auto] items-center gap-x-3 gap-y-3">
      <Label className="justify-end text-muted-foreground">URL vidéo</Label>
      <Input
        tabIndex={-1}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
      />
      <div />

      <Label className="justify-end text-muted-foreground">Début extrait</Label>
      <Input
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        placeholder="00:00:00"
      />
      <div className="flex items-center justify-end gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                onClick={onToggleSync}
                aria-pressed={syncTimecode}
                className={`inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
                  syncTimecode
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                Auto
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={6}
            >
              {syncTimecode
                ? "Timecode synchronisé avec le lecteur — cliquer pour désactiver"
                : "Timecode manuel — cliquer pour synchroniser avec le lecteur"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <IconAction
                tabIndex={-1}
                aria-label="Format du timecode"
                className="cursor-default"
              >
                <InfoIcon />
              </IconAction>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={6}
            >
              heures:minutes:secondes
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Label className="justify-end text-muted-foreground">Durée (s)</Label>
      <Input
        type="number"
        min={0}
        value={duration}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        placeholder="30"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              onClick={onApplyAllDurations}
              className="inline-flex h-8 w-full items-center justify-center rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60 hover:text-foreground"
            >
              Tous
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={6}
          >
            Appliquer cette durée à tous les extraits (y compris les futurs)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
