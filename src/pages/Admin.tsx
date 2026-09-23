import { useEffect, useRef, useState, type ReactNode } from "react";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import VideoPreviewPanel from "@/components/VideoPreviewPanel";
import { Button } from "@/components/ui/button";
import { useLiveJobs } from "@/hooks/useLiveJobs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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

// Crossfades between the two spots `usersActions` can appear in — visible
// fades in only once the other spot is mostly done fading out
function ActionsSlot({
  visible,
  children,
}: {
  visible: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`transition-opacity duration-100 ${
        visible ? "opacity-100 delay-150" : "pointer-events-none opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

// Admin dashboard: site figures, server status, account management
export default function Admin() {
  usePageMeta({
    title: "Administration · Vexia",
    path: "/admin",
    indexable: false,
  });

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
          !entry.isIntersecting &&
          entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        setActionsInHeader(scrolledPastTop);
      },
      // Grows the root 24px past the top, so the swap fires 24px late —
      // only once the title has been fully hidden for a bit, not right at the edge
      { root, threshold: 0, rootMargin: "12px 0px 0px 0px" },
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
  const selectedOwner = users.find((u) =>
    u.jobs.some((j) => j.id === selectedJobId),
  );
  const selectedJob = selectedOwner?.jobs.find((j) => j.id === selectedJobId);

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

  // Below 600px the header has no room for both buttons once they move up,
  // so "Nouvel utilisateur" stays put in the "Comptes" section and only
  // Refresh follows into the header.
  const isCompact = !useMediaQuery("(min-width: 600px)");

  const refreshButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={fetchUsers}
      disabled={loading}
      className="size-9 rounded-full p-0"
    >
      <RefreshCwIcon className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
    </Button>
  );
  const createButton = (
    <Button
      size="sm"
      onClick={() => setCreateOpen(true)}
      className="h-9 gap-1.5 rounded-full px-4 text-sm"
    >
      <PlusIcon className="size-3.5" />
      Nouvel utilisateur
    </Button>
  );
  // "Comptes" section always shows both; the header spot (see ActionsSlot
  // below) drops the create button on narrow screens.
  const sectionActions = (
    <div className="flex items-center gap-2">
      {refreshButton}
      {createButton}
    </div>
  );
  const headerActions = (
    <div className="flex items-center gap-2">
      {refreshButton}
      {!isCompact && createButton}
    </div>
  );

  return (
    <section className="flex gap-10 lg:px-10">
      <div className="flex h-[calc(100vh-var(--nav-h))] w-full flex-col">
        <div className="px-6 lg:px-0">
          <PageHeader
            eyebrow="Administration"
            title="Dashboard"
            action={
              <ActionsSlot visible={actionsInHeader}>
                {headerActions}
              </ActionsSlot>
            }
          />
          <div className="h-px shrink-0 bg-border" />
        </div>

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
            actions={
              <ActionsSlot visible={!actionsInHeader}>
                {sectionActions}
              </ActionsSlot>
            }
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
        title={selectedJob?.title}
        username={selectedOwner?.username}
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
