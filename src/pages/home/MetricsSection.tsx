import type { ReactNode } from "react";
import FadeIn from "@/components/FadeIn";
import FittedDuration from "@/components/FittedDuration";
import type { PublicMetrics } from "@/utils/api/render";
import { CONTAINER, NBSP, fmt } from "./shared";

// Key figures for the service, loaded by the page (dashes until they respond)
export default function MetricsSection({
  metrics,
}: {
  metrics: PublicMetrics | null;
}) {
  const items: { value: ReactNode; label: string }[] = [
    {
      value: metrics ? fmt(metrics.total_videos_created) : "—",
      label: "vidéos créées",
    },
    {
      value: metrics ? fmt(metrics.total_clips_used) : "—",
      label: "clips utilisés",
    },
    {
      value: metrics ? (
        <FittedDuration seconds={metrics.total_duration_seconds} />
      ) : (
        "—"
      ),
      label: "de contenu",
    },
    {
      value: metrics ? `+${fmt(metrics.money_earned)}${NBSP}€` : "—",
      label: "générés",
    },
  ];

  return (
    <section className={`${CONTAINER} py-16 lg:py-24`}>
      <FadeIn>
        <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {items.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 text-center"
            >
              {/* block + w-full: items-center would otherwise shrink this to
                  its own content, leaving FittedDuration nothing real to
                  measure against */}
              <span className="block w-full text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                {value}
              </span>
              <span className="text-sm text-muted-foreground lg:text-base">
                {label}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
