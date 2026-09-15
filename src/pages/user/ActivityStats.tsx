import { ClockIcon, FilmIcon, LayersIcon } from "lucide-react";
import MetricCard, { MetricSkeletons } from "@/components/MetricCard";
import SectionTitle from "@/components/SectionTitle";
import { formatDuration } from "@/lib/format";
import type { MeResponse } from "@/utils/api/auth";

// "Activity" section: the account's three counters
export default function ActivityStats({ me }: { me: MeResponse | null }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle
        title="Activité"
        description="Ton usage depuis la création du compte."
      />
      <div className="grid grid-cols-3 gap-3">
        {me ? (
          <>
            <MetricCard
              Icon={FilmIcon}
              label="Vidéos créées"
              value={String(me.total_videos_created)}
            />
            <MetricCard
              Icon={LayersIcon}
              label="Clips utilisés"
              value={String(me.total_clips_used)}
            />
            <MetricCard
              Icon={ClockIcon}
              label="Contenu généré"
              value={formatDuration(me.total_duration_seconds)}
            />
          </>
        ) : (
          <MetricSkeletons count={3} />
        )}
      </div>
    </div>
  );
}
