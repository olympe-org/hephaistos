import { useState } from "react";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// Confirmation prompt before an action (delete, revoke…)
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  subtitle,
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  // The item involved (username, video title…)
  subtitle?: string;
  danger?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {title}
          </DialogTitle>
          {subtitle && (
            <DialogDescription className="truncate">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            className="rounded-full"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
