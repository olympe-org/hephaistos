import { ArrowRightIcon, FilmIcon, LoaderIcon } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import type { RenderJob } from "@/store/renderSlice";
import type { MeResponse } from "@/utils/api/auth";
import JobRow from "./JobRow";

// "Videos" section: renders in progress then finished, newest to oldest
export default function VideosList({
  me,
  liveJobs,
  selectedJobId,
  onSelectJob,
  onJobCancelled,
  onCreate,
}: {
  me: MeResponse | null;
  liveJobs: Record<string, Partial<RenderJob>>;
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  onJobCancelled: (id: string) => void;
  onCreate: () => void;
}) {
  const jobs = [
    ...(me?.active_jobs ?? []).map((j) => ({ ...j, isActive: true })),
    ...(me?.done_jobs ?? []).map((j) => ({ ...j, isActive: false })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle
        title="Vidéos"
        description="Tes rendus, du plus récent au plus ancien."
        action={
          <Button
            className="h-9 shrink-0 gap-1.5 rounded-full px-4"
            onClick={onCreate}
          >
            Créer une vidéo
            <ArrowRightIcon className="size-3.5" />
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {!me ? (
          <div className="flex items-center justify-center py-16">
            <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
            <FilmIcon className="size-6 text-muted-foreground/60" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Aucun rendu</p>
              <p className="text-sm text-muted-foreground">
                Lance une création pour voir tes vidéos ici.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
              <span>Rendus</span>
              <span className="tabular-nums">{jobs.length}</span>
            </div>
            <div className="divide-y divide-border">
              {jobs.map((job, idx) => (
                <JobRow
                  key={job.job_id}
                  job={job}
                  idx={idx + 1}
                  isActive={job.isActive}
                  selectedJobId={selectedJobId}
                  onSelect={onSelectJob}
                  liveData={liveJobs[job.job_id]}
                  onCancelled={onJobCancelled}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
