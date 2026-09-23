import { ActivityIcon, FilmIcon, LayersIcon } from "lucide-react";
import CarouselRow, { CAROUSEL_ITEM } from "@/components/CarouselRow";
import FittedDuration from "@/components/FittedDuration";
import SectionTitle from "@/components/SectionTitle";
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
      <div className="px-6 lg:px-0">
        <SectionTitle
          title="Vue d'ensemble"
          description="Activité globale de la plateforme."
        />
      </div>
      <CarouselRow gridClassName="lg:grid-cols-2 min-[1220px]:grid-cols-4!">
        {metrics ? (
          <>
            <MetricCard
              Icon={FilmIcon}
              label="Vidéos créées"
              value={String(metrics.total_videos_created)}
              className={CAROUSEL_ITEM}
            />
            <MetricCard
              Icon={ActivityIcon}
              label="Contenu généré"
              value={<FittedDuration seconds={metrics.total_duration_seconds} />}
              className={CAROUSEL_ITEM}
            />
            <MetricCard
              Icon={LayersIcon}
              label="Clips utilisés"
              value={String(metrics.total_clips_used)}
              className={CAROUSEL_ITEM}
            />
            <RevenueCard
              value={metrics.money_earned}
              onSave={onSaveMoney}
              className={CAROUSEL_ITEM}
            />
          </>
        ) : (
          <MetricSkeletons className={CAROUSEL_ITEM} />
        )}
      </CarouselRow>
    </div>
  );
}
