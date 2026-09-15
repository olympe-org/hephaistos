import { XIcon } from "lucide-react";
import type { JsonClip, ParsedImport } from "./parseImportJson";

function GlobalTitlePreview({ g }: { g: NonNullable<ParsedImport["globalTitle"]> }) {
  return (
    <div className="mb-1 flex flex-col gap-0.5 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="text-xs text-muted-foreground">Titre global</span>
      {g.first && <span className="font-medium">{g.first}</span>}
      {g.second && <span className="font-medium">{g.second}</span>}
      {g.subtitle && <span className="text-muted-foreground">{g.subtitle}</span>}
    </div>
  );
}

function ClipPreview({ clip }: { clip: JsonClip }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm">
      <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
        {clip.id ?? ""}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {clip.title || <span className="text-muted-foreground italic">sans titre</span>}
        </span>
        {clip.subtitle && (
          <span className="block truncate text-xs text-muted-foreground">
            {clip.subtitle}
          </span>
        )}
        {clip.url && (
          <span className="block truncate font-mono text-xs text-muted-foreground">
            {clip.url}
          </span>
        )}
        <span className="mt-0.5 flex gap-3 text-xs text-muted-foreground">
          {clip.start_time && <span>Début {clip.start_time}</span>}
          {clip.duration && <span>{clip.duration} s</span>}
        </span>
      </span>
      {!clip.url && (
        <span
          className="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-destructive"
          title="Aucune URL vidéo"
        >
          <XIcon className="size-3" />
          URL
        </span>
      )}
    </div>
  );
}

// Right column of the import dialog: preview of the JSON as it will be imported
export default function ImportPreview({
  parsed,
  hasInput,
}: {
  parsed: ParsedImport | null;
  // Distinguishes "nothing typed yet" from "invalid JSON" for the placeholder message
  hasInput: boolean;
}) {
  if (!parsed) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">
          {hasInput ? "JSON invalide" : "En attente de données…"}
        </p>
      </div>
    );
  }

  return (
    <>
      {parsed.globalTitle && <GlobalTitlePreview g={parsed.globalTitle} />}
      {parsed.clips.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">Aucun extrait</p>
      ) : (
        parsed.clips.map((clip, i) => (
          <ClipPreview
            key={i}
            clip={clip}
          />
        ))
      )}
    </>
  );
}
