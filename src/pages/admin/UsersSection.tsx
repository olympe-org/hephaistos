import type { ReactNode, RefObject } from "react";
import { LoaderIcon, XIcon } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import type { RenderJob } from "@/store/renderSlice";
import type { AdminUser } from "@/utils/api/admin";
import UserRow from "./UserRow";

// "Accounts" section: header with actions + list of users
export default function UsersSection({
  users,
  loading,
  onRefresh,
  titleRef,
  actions,
  selectedJobId,
  onSelectJob,
  onJobDeleted,
  liveJobs,
  onCancelJob,
}: {
  users: AdminUser[];
  loading: boolean;
  onRefresh: () => void;
  // Watched to move `actions` up into the page header once this title
  // scrolls out of view — see Admin.tsx
  titleRef?: RefObject<HTMLDivElement | null>;
  actions?: ReactNode;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onJobDeleted: (jobId: string) => void;
  liveJobs: Record<string, Partial<RenderJob>>;
  onCancelJob: (jobId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-6 lg:px-0">
      <div ref={titleRef}>
        <SectionTitle
          title="Comptes"
          description={`${users.length} utilisateur${users.length !== 1 ? "s" : ""}`}
          action={actions}
          stackActionsBelow
        />
      </div>

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
