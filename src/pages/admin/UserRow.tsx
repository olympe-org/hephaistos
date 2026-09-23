import { useState, type ReactNode } from "react";
import { ChevronDownIcon, MailIcon, PencilIcon, ShieldOffIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import ActionsDialog from "@/components/ActionsDialog";
import AdminBadge from "@/components/AdminBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import FeatureBadge from "@/components/FeatureBadge";
import FittedDuration from "@/components/FittedDuration";
import QrDialog from "@/components/QrDialog";
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

  const [expanded, setExpanded] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<"revoke" | "delete" | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobRef | null>(null);
  // qrJob is never cleared on close (only qrOpen is) — otherwise its title
  // would blank out immediately while the dialog is still animating shut.
  const [qrJob, setQrJob] = useState<JobRef | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

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

  const stats: { label: string; value: ReactNode }[] = [
    { label: "Vidéos", value: String(user.total_videos_created) },
    { label: "Clips", value: String(user.total_clips_used) },
    {
      label: "Contenu",
      value: <FittedDuration seconds={user.total_duration_seconds} />,
    },
  ];

  return (
    <>
      <div className="flex flex-col rounded-2xl border border-border bg-background p-5 transition-colors duration-200 hover:border-foreground/25">
        {/* Identity — click to expand/collapse the card below; the avatar
            itself opens the edit/revoke/delete actions dialog instead */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpanded((v) => !v);
            }
          }}
          className="flex min-w-0 cursor-pointer items-start gap-3"
        >
          <button
            type="button"
            aria-label="Actions sur le compte"
            onClick={(e) => {
              e.stopPropagation();
              setActionsOpen(true);
            }}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase transition-colors hover:bg-muted-foreground/20"
          >
            {user.username.slice(0, 1)}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
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
          <ChevronDownIcon
            className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Stats + renders — smoothly unrolls via the grid-rows trick
            (0fr -> 1fr), no JS height measurement needed */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="flex flex-col gap-5 overflow-hidden">
            <div className="grid grid-cols-1 gap-3 pt-5 min-[420px]:grid-cols-3">
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-xl bg-muted/40 px-3.5 py-3"
                >
                  <span className="text-xs text-muted-foreground">
                    {label}
                  </span>
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
              onShowQr={(job) => {
                setQrJob(job);
                setQrOpen(true);
              }}
              onDeleteJob={setJobToDelete}
            />
          </div>
        </div>
      </div>

      <ActionsDialog
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        subtitle={user.username}
        actions={[
          { label: "Modifier", Icon: PencilIcon, onClick: () => setEditOpen(true) },
          { label: "Révoquer les tokens", Icon: ShieldOffIcon, onClick: () => setConfirm("revoke") },
          ...(isSelf
            ? []
            : [
                {
                  label: "Supprimer l'utilisateur",
                  Icon: TrashIcon,
                  danger: true,
                  onClick: () => setConfirm("delete"),
                },
              ]),
        ]}
      />
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
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        jobId={qrJob?.id ?? ""}
        title={qrJob?.title ?? ""}
        username={user.username}
      />
    </>
  );
}
