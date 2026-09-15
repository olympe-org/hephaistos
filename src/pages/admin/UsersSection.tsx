import { LoaderIcon, PlusIcon, RefreshCwIcon, XIcon } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import type { RenderJob } from "@/store/renderSlice";
import type { AdminUser } from "@/utils/api/admin";
import UserRow from "./UserRow";

// "Accounts" section: header with actions + list of users
export default function UsersSection({
  users,
  loading,
  onRefresh,
  onCreate,
  selectedJobId,
  onSelectJob,
  onJobDeleted,
  liveJobs,
  onCancelJob,
}: {
  users: AdminUser[];
  loading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onJobDeleted: (jobId: string) => void;
  liveJobs: Record<string, Partial<RenderJob>>;
  onCancelJob: (jobId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle
        title="Comptes"
        description={`${users.length} utilisateur${users.length !== 1 ? "s" : ""}`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="size-9 rounded-full p-0"
            >
              <RefreshCwIcon
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              size="sm"
              onClick={onCreate}
              className="h-9 gap-1.5 rounded-full px-4 text-sm"
            >
              <PlusIcon className="size-3.5" />
              Nouvel utilisateur
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <LoaderIcon className="size-6 text-muted-foreground animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-muted-foreground">
            <XIcon className="size-6 opacity-60" />
            <p className="text-sm">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              onAction={onRefresh}
              onSelectJob={onSelectJob}
              selectedJobId={selectedJobId}
              onJobDeleted={onJobDeleted}
              liveJobs={liveJobs}
              onCancelJob={onCancelJob}
            />
          ))
        )}
      </div>
    </div>
  );
}
