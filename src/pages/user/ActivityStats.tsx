import { ClockIcon, FilmIcon, LayersIcon } from "lucide-react";
import CarouselRow, { CAROUSEL_ITEM } from "@/components/CarouselRow";
import FittedDuration from "@/components/FittedDuration";
import MetricCard, { MetricSkeletons } from "@/components/MetricCard";
import SectionTitle from "@/components/SectionTitle";
import type { MeResponse } from "@/utils/api/auth";

// "Activity" section: the account's three counters
export default function ActivityStats({ me }: { me: MeResponse | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="px-6 lg:px-0">
        <SectionTitle
          title="Activité"
          description="Ton usage depuis la création du compte."
        />
      </div>
      <CarouselRow gridClassName="lg:grid-cols-3">
        {me ? (
          <>
            <MetricCard
              Icon={FilmIcon}
              label="Vidéos créées"
              value={String(me.total_videos_created)}
              className={CAROUSEL_ITEM}
            />
            <MetricCard
              Icon={LayersIcon}
              label="Clips utilisés"
              value={String(me.total_clips_used)}
              className={CAROUSEL_ITEM}
            />
            <MetricCard
              Icon={ClockIcon}
              label="Contenu généré"
              value={<FittedDuration seconds={me.total_duration_seconds} />}
              className={CAROUSEL_ITEM}
            />
          </>
        ) : (
          <MetricSkeletons
            count={3}
            className={CAROUSEL_ITEM}
          />
        )}
      </CarouselRow>
    </div>
  );
}
