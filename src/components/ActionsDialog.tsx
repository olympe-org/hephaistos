import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Action {
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

// Reusable "pick an action" dialog — mobile has no hover, so tapping a job
// row or a user's avatar opens this instead of revealing inline icons.
export default function ActionsDialog({
  open,
  onClose,
  subtitle,
  // Owning account — admin only, so it's clear whose video this is
  username,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  subtitle: string;
  username?: string;
  actions: Action[];
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="max-w-xs rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Que veux-tu faire ?
          </DialogTitle>
          {username && (
            <p className="truncate text-sm text-muted-foreground">{username}</p>
          )}
          <DialogDescription className="truncate">{subtitle}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {actions.map(({ label, Icon, onClick, danger }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                onClick();
                onClose();
              }}
              className={`flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-muted/60 ${
                danger ? "text-destructive" : ""
              }`}
            >
              <Icon
                className={`size-4 ${danger ? "text-destructive" : "text-muted-foreground"}`}
              />
              {label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
