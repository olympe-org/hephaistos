import { useState } from "react";
import ImportPreview from "./import-json/ImportPreview";
import {
  IMPORT_JSON_PLACEHOLDER,
  parseImportJson,
  toClipData,
  toGlobalTitle,
  type ParsedImport,
} from "./import-json/parseImportJson";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { useAppDispatch } from "@/store";
import { setClips, updateGlobalTitle } from "@/store/createVideoSlice";

// Bulk import: paste JSON on the left, the list of clips previews on the
// right as you type
export default function ImportJsonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedImport | null>(null);

  const reset = () => {
    setRaw("");
    setParsed(null);
    setError(null);
  };

  const handleChange = (value: string) => {
    setRaw(value);
    if (!value.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    const { result, error } = parseImportJson(value);
    setParsed(result);
    setError(error);
  };

  const handleConfirm = () => {
    if (!parsed) return;
    if (parsed.globalTitle) dispatch(updateGlobalTitle(toGlobalTitle(parsed.globalTitle)));
    dispatch(setClips(parsed.clips.map(toClipData)));
    onOpenChange(false);
    reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const clipCount = parsed?.clips.length ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[80dvw]">
        <div className="flex shrink-0 flex-col gap-1 border-b px-6 py-5 pr-16">
          <h2 className="text-lg font-semibold tracking-tight">Importer un JSON</h2>
          <p className="text-sm text-muted-foreground">
            Colle un tableau d'extraits{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">[ … ]</code>{" "}
            ou un objet complet avec titre global{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              {"{ title: {…}, data: [ … ] }"}
            </code>
            . L'aperçu se met à jour au fur et à mesure.
          </p>
        </div>

        <div className="grid h-[65vh] min-h-0 grid-cols-[1fr_auto_1fr]">
          {/* Left column — input */}
          <div className="flex min-h-0 flex-col gap-3 p-5">
            <textarea
              className="w-full flex-1 resize-none rounded-xl border border-input bg-transparent px-3.5 py-3 font-mono text-xs leading-relaxed text-foreground transition-all placeholder:text-muted-foreground/70 hover:border-foreground/30 focus:border-violet-400 focus:ring-3 focus:ring-violet-400/20 focus:outline-none"
              placeholder={IMPORT_JSON_PLACEHOLDER}
              value={raw}
              onChange={(e) => handleChange(e.target.value)}
              spellCheck={false}
            />
            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <Separator orientation="vertical" />

          {/* Right column — preview */}
          <div className="flex min-h-0 flex-col gap-3 p-5">
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-semibold">Aperçu</span>
              {parsed && (
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium tabular-nums">
                  {clipCount} extrait{clipCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
              <ImportPreview
                parsed={parsed}
                hasInput={raw.trim() !== ""}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-full px-4 text-sm"
                onClick={handleClose}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-full px-4 text-sm"
                onClick={handleConfirm}
                disabled={!parsed || clipCount === 0}
              >
                Importer {parsed && clipCount > 0 ? `(${clipCount})` : ""}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
