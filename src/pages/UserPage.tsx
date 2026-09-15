import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import AdminBadge from "@/components/AdminBadge";
import PageHeader from "@/components/PageHeader";
import VideoPreviewPanel from "@/components/VideoPreviewPanel";
import { Button } from "@/components/ui/button";
import { useLiveJobs } from "@/hooks/useLiveJobs";
import { useVideoPreview } from "@/hooks/useVideoPreview";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import { getMe, type MeResponse } from "@/utils/api/auth";
import AccountCards from "./user/AccountCards";
import ActivityStats from "./user/ActivityStats";
import VideosList from "./user/VideosList";

// Profile: activity, account, list of renders and preview of the selected video
export default function UserPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const storeUsername = useAppSelector((s) => s.auth.username);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const refreshMe = () =>
    getMe()
      .then(setMe)
      .catch(() => {});

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch(() => toast.error("Impossible de charger le profil."));
  }, []);

  const activeJobIds = me?.active_jobs.map((j) => j.job_id) ?? [];
  const { liveJobs } = useLiveJobs(activeJobIds, refreshMe);
  const { videoUrl, loading: videoLoading } = useVideoPreview(selectedJobId);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Locally remove a cancelled render (useLiveJobs tears down its SSE stream)
  const removeActiveJob = (id: string) =>
    setMe((m) =>
      m
        ? { ...m, active_jobs: m.active_jobs.filter((j) => j.job_id !== id) }
        : null,
    );

  return (
    <section className="flex gap-10 px-6 lg:px-10">
      <div className="flex h-[calc(100vh-var(--nav-h))] w-full flex-col">
        <PageHeader
          eyebrow="Profil"
          title={me?.username ?? storeUsername ?? "—"}
          badge={me?.is_admin && <AdminBadge />}
          action={
            <Button
              variant="outline"
              className="mt-1 h-9 shrink-0 gap-1.5 rounded-full px-4"
              onClick={handleLogout}
            >
              <LogOutIcon className="size-3.5" />
              Se déconnecter
            </Button>
          }
        />
        <div className="h-px shrink-0 bg-border" />

        <div className="no-scrollbar flex flex-1 flex-col gap-10 overflow-x-hidden overflow-y-auto py-8">
          <ActivityStats me={me} />
          <AccountCards me={me} />
          <VideosList
            me={me}
            liveJobs={liveJobs}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            onJobCancelled={removeActiveJob}
            onCreate={() => navigate("/create-video")}
          />
        </div>
      </div>

      <VideoPreviewPanel
        jobId={selectedJobId}
        videoUrl={videoUrl}
        loading={videoLoading}
      />
    </section>
  );
}
