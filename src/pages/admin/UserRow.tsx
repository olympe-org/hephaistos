import { useState } from "react";
import { MailIcon, PencilIcon, ShieldOffIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import AdminBadge from "@/components/AdminBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import FeatureBadge from "@/components/FeatureBadge";
import IconAction from "@/components/IconAction";
import QrDialog from "@/components/QrDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store";
import { setUserData } from "@/store/authSlice";
import type { RenderJob } from "@/store/renderSlice";
import {
  deleteAdminUser,
  patchAdminUser,
  revokeUserTokens,
  type AdminUser,
} from "@/utils/api/admin";
import { getMe } from "@/utils/api/auth";
import { cancelRender } from "@/utils/api/render";
import UserDialog from "./UserDialog";
import { parseFeatures, type UserFormData } from "./userForm";
import UserJobs, { type JobRef } from "./UserJobs";

// An account's card: identity, actions, stats and its list of renders
export default function UserRow({
  user,
  onAction,
  onSelectJob,
  selectedJobId,
  onJobDeleted,
  liveJobs,
  onCancelJob,
}: {
  user: AdminUser;
  // Reload the list after a change
  onAction: () => void;
  onSelectJob: (jobId: string) => void;
  selectedJobId: string | null;
  onJobDeleted: (jobId: string) => void;
  liveJobs: Record<string, Partial<RenderJob>>;
  onCancelJob: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  const currentUsername = useAppSelector((s) => s.auth.username);
  const isSelf = user.username === currentUsername;

  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<"revoke" | "delete" | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobRef | null>(null);
  const [qrJob, setQrJob] = useState<JobRef | null>(null);

  const handleEdit = async (form: UserFormData) => {
    const body: Record<string, unknown> = {
      features: parseFeatures(form.features),
      max_jobs: form.max_jobs,
      email: form.email.trim() || null,
    };
    if (form.password) body.password = form.password;
    await patchAdminUser(user.id, body);
    toast.success(`"${user.username}" mis à jour.`);

    // If the admin is editing their own account, refresh their info in the store
    if (isSelf) {
      getMe()
        .then((me) =>
          dispatch(
            setUserData({
              username: me.username,
              isAdmin: me.is_admin,
              features: me.features,
              maxJobs: me.max_jobs,
            }),
          ),
        )
        .catch(() => {});
    }
    onAction();
  };

  const handleRevoke = async () => {
    await revokeUserTokens(user.id);
    toast.success("Tokens révoqués.");
    onAction();
  };

  const handleDelete = async () => {
    await deleteAdminUser(user.id);
    toast.success(`"${user.username}" supprimé.`);
    onAction();
  };

  const handleDeleteJob = async () => {
    const id = jobToDelete!.id;
    await cancelRender(id);
    toast.success("Vidéo supprimée.");
    onJobDeleted(id);
    onAction();
  };

  const stats = [
    { label: "Vidéos", value: String(user.total_videos_created) },
    { label: "Clips", value: String(user.total_clips_used) },
    { label: "Contenu", value: formatDuration(user.total_duration_seconds) },
  ];

  return (
    <>
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-5 transition-colors duration-200 hover:border-foreground/25">
        {/* Identity + actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
              {user.username.slice(0, 1)}
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold tracking-tight">
                  {user.username}
                </span>
                {user.is_admin && <AdminBadge />}
                {user.features.map((f) => (
                  <FeatureBadge
                    key={f}
                    label={f}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {user.email && (
                  <>
                    <span className="flex items-center gap-1">
                      <MailIcon className="size-3 shrink-0" />
                      {user.email}
                    </span>
                    <span aria-hidden>·</span>
                  </>
                )}
                <span>
                  Créé le{" "}
                  {new Date(user.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span aria-hidden>·</span>
                <span>
                  max {user.max_jobs} job{user.max_jobs > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <TooltipProvider>
            <div className="flex shrink-0 items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconAction
                    aria-label="Modifier"
                    onClick={() => setEditOpen(true)}
                  >
                    <PencilIcon />
                  </IconAction>
                </TooltipTrigger>
                <TooltipContent side="bottom">Modifier</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconAction
                    aria-label="Révoquer les tokens"
                    onClick={() => setConfirm("revoke")}
                  >
                    <ShieldOffIcon />
                  </IconAction>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Révoquer les tokens
                </TooltipContent>
              </Tooltip>
              {!isSelf && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconAction
                      danger
                      aria-label="Supprimer l'utilisateur"
                      onClick={() => setConfirm("delete")}
                    >
                      <TrashIcon />
                    </IconAction>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Supprimer l'utilisateur
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-xl bg-muted/40 px-3.5 py-3"
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-lg font-semibold leading-none tracking-tight tabular-nums">
                {value}
              </span>
            </div>
          ))}
        </div>

        <UserJobs
          user={user}
          liveJobs={liveJobs}
          selectedJobId={selectedJobId}
          onSelectJob={onSelectJob}
          onCancelJob={onCancelJob}
          onShowQr={setQrJob}
          onDeleteJob={setJobToDelete}
        />
      </div>

      <UserDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        initial={{
          features: user.features.join(", "),
          max_jobs: user.max_jobs,
          email: user.email ?? "",
        }}
        mode="edit"
        username={user.username}
      />
      <ConfirmDialog
        open={confirm === "revoke"}
        onClose={() => setConfirm(null)}
        onConfirm={handleRevoke}
        title="Révoquer les tokens"
        description="Tous les tokens actifs seront invalidés. L'utilisateur sera déconnecté."
        subtitle={user.username}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        description="Cet utilisateur sera définitivement supprimé. Cette action est irréversible."
        subtitle={user.username}
        danger
      />
      <ConfirmDialog
        open={jobToDelete !== null}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
        title="Supprimer la vidéo"
        description="Cette vidéo sera supprimée du serveur. Cette action est irréversible."
        subtitle={jobToDelete?.title}
        danger
      />
      <QrDialog
        open={qrJob !== null}
        onClose={() => setQrJob(null)}
        jobId={qrJob?.id ?? ""}
        title={qrJob?.title ?? ""}
      />
    </>
  );
}
