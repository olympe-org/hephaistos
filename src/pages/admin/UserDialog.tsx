import { useEffect, useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EMPTY_FORM, type UserFormData } from "./userForm";

const INPUT = "h-10 rounded-xl px-3.5";

// Form to create / edit an account
export default function UserDialog({
  open,
  onClose,
  onSave,
  initial,
  mode,
  username,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  initial?: Partial<UserFormData>;
  mode: "create" | "edit";
  username?: string;
}) {
  const [form, setForm] = useState<UserFormData>({ ...EMPTY_FORM, ...initial });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isCreate = mode === "create";

  // Starts back from the initial values every time it opens
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, ...initial });
      setShowPwd(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- `initial` is an object recreated on every render

  const set = (key: keyof UserFormData) => (value: string | boolean | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      toast.error(
        isCreate
          ? "Erreur lors de la création."
          : "Erreur lors de la modification.",
      );
    } finally {
      setLoading(false);
    }
  };

  const canSave =
    !loading &&
    form.email.trim() !== "" &&
    (!isCreate || (form.username.trim() !== "" && form.password.trim() !== ""));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isCreate ? "Nouvel utilisateur" : "Modifier l'utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isCreate ? "Crée un compte et définis ses accès." : username}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder="user@example.com"
              autoComplete="off"
              className={INPUT}
            />
          </div>

          {isCreate && (
            <div className="flex flex-col gap-1.5">
              <Label>Nom d'utilisateur</Label>
              <Input
                value={form.username}
                onChange={(e) => set("username")(e.target.value)}
                placeholder="paul"
                autoComplete="off"
                className={INPUT}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>{isCreate ? "Mot de passe" : "Nouveau mot de passe"}</Label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password")(e.target.value)}
                placeholder={
                  isCreate ? "••••••••" : "Laisser vide pour ne pas changer"
                }
                className={`${INPUT} pr-11`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPwd ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Features (séparées par virgule)</Label>
            <Input
              value={form.features}
              onChange={(e) => set("features")(e.target.value)}
              placeholder="claude, beta"
              className={INPUT}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Max jobs</Label>
            <Input
              type="number"
              min={1}
              value={form.max_jobs}
              onChange={(e) => set("max_jobs")(Number(e.target.value))}
              className={INPUT}
            />
          </div>

          {isCreate && (
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-sm font-medium">Administrateur</span>
              <Switch
                checked={form.is_admin}
                onCheckedChange={(v) => set("is_admin")(v)}
              />
            </div>
          )}
        </div>

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
            className="rounded-full"
            onClick={handleSave}
            disabled={!canSave}
          >
            {loading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            {isCreate ? "Créer" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
