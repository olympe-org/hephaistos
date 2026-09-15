import { ActivityIcon, FilmIcon, LayersIcon } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { formatDuration } from "@/lib/format";
import type { PublicMetrics } from "@/utils/api/render";
import MetricCard, { MetricSkeletons } from "@/components/MetricCard";
import RevenueCard from "./RevenueCard";

// "Overview" section: the site's public figures + editable revenue
export default function OverviewMetrics({
  metrics,
  onSaveMoney,
}: {
  metrics: PublicMetrics | null;
  onSaveMoney: (value: number) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle
        title="Vue d'ensemble"
        description="Activité globale de la plateforme."
      />
      <div className="grid grid-cols-4 gap-3">
        {metrics ? (
          <>
            <MetricCard
              Icon={FilmIcon}
              label="Vidéos créées"
              value={String(metrics.total_videos_created)}
            />
            <MetricCard
              Icon={ActivityIcon}
              label="Contenu généré"
              value={formatDuration(metrics.total_duration_seconds)}
            />
            <MetricCard
              Icon={LayersIcon}
              label="Clips utilisés"
              value={String(metrics.total_clips_used)}
            />
            <RevenueCard
              value={metrics.money_earned}
              onSave={onSaveMoney}
            />
          </>
        ) : (
          <MetricSkeletons />
        )}
      </div>
    </div>
  );
}
