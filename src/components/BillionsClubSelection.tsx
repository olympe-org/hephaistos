import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ApiTitle } from "@/utils/billionsClub.types";
import { formatStreams } from "@/utils/billionsClub.types";

export default function BillionsClubSelection({
  selected,
  labelFormat,
  onLabelFormatChange,
  onToggle,
  onClear,
  onCancel,
  onConfirm,
}: {
  selected: ApiTitle[];
  labelFormat: string;
  onLabelFormatChange: (v: string) => void;
  onToggle: (t: ApiTitle) => void;
  onClear: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Sélection</span>
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium tabular-nums">
            {selected.length}
          </span>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Tout effacer
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {selected.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              Aucun titre sélectionné
            </p>
          </div>
        ) : (
          selected.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{t.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {t.artists.map((a) => a.artist_name).join(", ")}
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatStreams(t.streams_count)}
              </span>
              <button
                type="button"
                onClick={() => onToggle(t)}
                className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Retirer"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">Format</span>
          <Select
            value={labelFormat}
            onValueChange={onLabelFormatChange}
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-artist-streams">
                Titre - Artiste (streams)
              </SelectItem>
              <SelectItem value="title-streams">Titre (streams)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-full px-4 text-sm"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-full px-4 text-sm"
            onClick={onConfirm}
            disabled={selected.length === 0}
          >
            Importer ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
