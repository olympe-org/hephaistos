import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import VideoPreviewPanel from "@/components/VideoPreviewPanel";
import { useLiveJobs } from "@/hooks/useLiveJobs";
import { useVideoPreview } from "@/hooks/useVideoPreview";
import {
  createAdminUser,
  getAdminUsers,
  patchAdminMetrics,
  type AdminUser,
} from "@/utils/api/admin";
import { getPublicMetrics, type PublicMetrics } from "@/utils/api/render";
import OverviewMetrics from "./admin/OverviewMetrics";
import SystemMetrics from "./admin/SystemMetrics";
import UsersSection from "./admin/UsersSection";
import UserDialog from "./admin/UserDialog";
import { parseFeatures, type UserFormData } from "./admin/userForm";
import { useSystemMetrics } from "./admin/useSystemMetrics";

// Delay before reloading accounts after a render finishes (the backend is finalizing)
const REFRESH_DELAY_MS = 5_000;

// Admin dashboard: site figures, server status, account management
export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [siteMetrics, setSiteMetrics] = useState<PublicMetrics | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await getAdminUsers());
    } catch {
      toast.error("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteMetrics = () =>
    getPublicMetrics()
      .then(setSiteMetrics)
      .catch(() => {});

  useEffect(() => {
    fetchUsers();
    fetchSiteMetrics();
  }, []);

  const { metrics, netRate } = useSystemMetrics();
  const activeJobIds = users.flatMap((u) =>
    (u.active_jobs ?? []).map((j) => j.job_id),
  );
  const { liveJobs, forgetJob } = useLiveJobs(activeJobIds, () =>
    setTimeout(fetchUsers, REFRESH_DELAY_MS),
  );
  const { videoUrl, loading: videoLoading } = useVideoPreview(selectedJobId);

  const saveMoney = async (value: number) => {
    await patchAdminMetrics({ money_earned: value });
    toast.success("Revenus mis à jour.");
    fetchSiteMetrics();
  };

  const handleCreate = async (form: UserFormData) => {
    await createAdminUser({
      username: form.username,
      password: form.password,
      is_admin: form.is_admin,
      features: parseFeatures(form.features),
      max_jobs: form.max_jobs,
      email: form.email.trim(),
    });
    toast.success(`"${form.username}" créé.`);
    fetchUsers();
  };

  return (
    <section className="flex gap-10 px-6 lg:px-10">
      <div className="flex h-[calc(100vh-var(--nav-h))] w-full flex-col">
        <PageHeader
          eyebrow="Administration"
          title="Dashboard"
        />
        <div className="h-px shrink-0 bg-border" />

        <div className="no-scrollbar flex flex-1 flex-col gap-10 overflow-x-hidden overflow-y-auto py-8">
          <OverviewMetrics
            metrics={siteMetrics}
            onSaveMoney={saveMoney}
          />
          <SystemMetrics
            metrics={metrics}
            netRate={netRate}
          />
          <UsersSection
            users={users}
            loading={loading}
            onRefresh={fetchUsers}
            onCreate={() => setCreateOpen(true)}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            onJobDeleted={(id) => {
              if (id === selectedJobId) setSelectedJobId(null);
            }}
            liveJobs={liveJobs}
            onCancelJob={forgetJob}
          />
        </div>
      </div>

      <VideoPreviewPanel
        jobId={selectedJobId}
        videoUrl={videoUrl}
        loading={videoLoading}
      />

      <UserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        mode="create"
      />
    </section>
  );
}
