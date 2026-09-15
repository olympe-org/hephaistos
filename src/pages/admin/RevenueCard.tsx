import { useState } from "react";
import { BanknoteIcon, CheckIcon, LoaderIcon, PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// "Revenue" card, editable in place (pencil → input → Save / Cancel)
export default function RevenueCard({
  value,
  onSave,
}: {
  value: number;
  onSave: (value: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const save = async () => {
    const parsed = parseFloat(draft);
    if (isNaN(parsed)) return;
    setSaving(true);
    try {
      await onSave(parsed);
      setEditing(false);
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2">
          <BanknoteIcon className="size-4" />
          <span className="text-sm">Revenus</span>
        </div>
        {!editing && (
          <button
            onClick={startEditing}
            className="hover:text-foreground transition-colors"
          >
            <PencilIcon className="size-3" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2.5 mt-0.5">
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border-b border-foreground/30 bg-transparent pb-1 text-3xl font-semibold leading-none tracking-[-0.03em] tabular-nums focus:border-foreground focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="h-7 flex-1 gap-1 rounded-full px-2.5 text-xs"
              onClick={save}
              disabled={saving}
            >
              {saving ? (
                <LoaderIcon className="size-3 animate-spin" />
              ) : (
                <CheckIcon className="size-3" />
              )}
              Enregistrer
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 flex-1 gap-1 rounded-full px-2.5 text-xs"
              onClick={() => setEditing(false)}
            >
              <XIcon className="size-3" />
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <span className="text-3xl font-semibold leading-none tracking-[-0.03em] tabular-nums">
          {value.toFixed(2)} €
        </span>
      )}
    </div>
  );
}
