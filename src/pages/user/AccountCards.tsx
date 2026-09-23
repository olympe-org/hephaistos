import CarouselRow from "@/components/CarouselRow";
import FeatureBadge from "@/components/FeatureBadge";
import SectionTitle from "@/components/SectionTitle";
import { PANEL } from "@/lib/tokens";
import type { MeResponse } from "@/utils/api/auth";

// Wider than CarouselRow's default CAROUSEL_ITEM — these cards carry more
// text (badges, quota bar) than a plain metric value.
const CAROUSEL_ITEM =
  "w-[78vw] max-w-80 shrink-0 snap-start lg:w-auto lg:max-w-none lg:shrink";

// "Account" section: features, render quota, e-mail. Any card can be
// absent (no features, no e-mail); whichever card ends up alone on the
// last row spans both columns instead of leaving a gap.
export default function AccountCards({ me }: { me: MeResponse | null }) {
  const max = me?.max_jobs ?? 0;
  const used = me ? me.done_jobs.length + me.active_jobs.length : 0;
  const atMax = me !== null && used >= max;
  const quotaPercent = max > 0 ? Math.min(100, (used / max) * 100) : 0;

  // Shown while loading (me === null) so nothing pops in/out once it resolves
  const hasFeatures = me === null || me.features.length > 0;
  const hasEmail = me === null || !!me.email;
  const cardCount = (hasFeatures ? 1 : 0) + 1 + (hasEmail ? 1 : 0);
  const isOddCount = cardCount % 2 === 1;
  // Quota is always present, so it's the one left alone when e-mail isn't
  const quotaSpansFull = isOddCount && !hasEmail;
  const emailSpansFull = isOddCount && hasEmail;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-6 lg:px-0">
        <SectionTitle
          title="Compte"
          description="Fonctionnalités activées et quota de rendus."
        />
      </div>
      {/* order-* still applies in CarouselRow's flex mode, so Quota stays
          first there too */}
      <CarouselRow gridClassName="lg:grid-cols-2">
        {hasFeatures && (
          <div
            className={`order-2 flex flex-col gap-3 lg:order-1 ${CAROUSEL_ITEM} ${PANEL}`}
          >
            <span className="text-sm text-muted-foreground">
              Fonctionnalités
            </span>
            {me ? (
              <div className="flex flex-wrap gap-1.5">
                {me.features.map((f) => (
                  <FeatureBadge
                    key={f}
                    label={f}
                  />
                ))}
              </div>
            ) : (
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            )}
          </div>
        )}

        <div
          className={`order-1 flex flex-col gap-3 lg:order-2 ${quotaSpansFull ? "lg:col-span-2" : ""} ${CAROUSEL_ITEM} ${PANEL}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Quota de rendus</span>
            {me && (
              <span className="text-sm font-medium tabular-nums">
                {used} / {max}
              </span>
            )}
          </div>
          {me ? (
            <>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-500"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              {atMax && (
                <span className="text-xs text-muted-foreground">
                  Le prochain rendu remplacera le plus ancien.
                </span>
              )}
            </>
          ) : (
            <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
          )}
        </div>

        {hasEmail && (
          <div
            className={`order-3 flex flex-col gap-2 ${emailSpansFull ? "lg:col-span-2" : ""} ${CAROUSEL_ITEM} ${PANEL}`}
          >
            <span className="text-sm text-muted-foreground">Email</span>
            {me ? (
              <span className="text-sm font-medium">{me.email}</span>
            ) : (
              <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            )}
          </div>
        )}
      </CarouselRow>
    </div>
  );
}
