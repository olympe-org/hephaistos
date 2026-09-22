import { useEffect, useRef, useState } from "react";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import VideoPreviewPanel from "@/components/VideoPreviewPanel";
import { Button } from "@/components/ui/button";
import { useLiveJobs } from "@/hooks/useLiveJobs";
import { usePageMeta } from "@/hooks/usePageMeta";
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
  usePageMeta({ title: "Administration · Vexia", path: "/admin", indexable: false });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [siteMetrics, setSiteMetrics] = useState<PublicMetrics | null>(null);
  // Once the "Comptes" title scrolls above the scroll area, its actions move
  // up into the page header instead — never both at once, so there's no
  // flash of the base spot's buttons before the header's own appear.
  const scrollRef = useRef<HTMLDivElement>(null);
  const usersTitleRef = useRef<HTMLDivElement>(null);
  const [actionsInHeader, setActionsInHeader] = useState(false);

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

  useEffect(() => {
    const target = usersTitleRef.current;
    const root = scrollRef.current;
    if (!target || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only when it's scrolled past above (not simply not-reached-yet below)
        const scrolledPastTop =
          !entry.isIntersecting && entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        setActionsInHeader(scrolledPastTop);
      },
      { root, threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
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

  // Shared between the "Comptes" title and the page header — only one
  // shows it at a time (see the IntersectionObserver above)
  const usersActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={fetchUsers}
        disabled={loading}
        className="size-9 rounded-full p-0"
      >
        <RefreshCwIcon className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
      </Button>
      <Button
        size="sm"
        onClick={() => setCreateOpen(true)}
        className="h-9 gap-1.5 rounded-full px-4 text-sm"
      >
        <PlusIcon className="size-3.5" />
        Nouvel utilisateur
      </Button>
    </div>
  );

  return (
    <section className="flex gap-10 px-6 lg:px-10">
      <div className="flex h-[calc(100vh-var(--nav-h))] w-full flex-col">
        <PageHeader
          eyebrow="Administration"
          title="Dashboard"
          action={actionsInHeader ? usersActions : undefined}
        />
        <div className="h-px shrink-0 bg-border" />

        <div
          ref={scrollRef}
          className="no-scrollbar flex flex-1 flex-col gap-10 overflow-x-hidden overflow-y-auto py-8"
        >
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
            titleRef={usersTitleRef}
            actions={actionsInHeader ? undefined : usersActions}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            onJobDeleted={(id) => {
              if (id === selectedJobId) setSelectedJobId(null);
            }}
            liveJobs={liveJobs}
            onCancelJob={(id) => {
              forgetJob(id);
              fetchUsers();
            }}
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
