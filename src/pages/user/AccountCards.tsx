import FeatureBadge from "@/components/FeatureBadge";
import SectionTitle from "@/components/SectionTitle";
import { PANEL } from "@/lib/tokens";
import type { MeResponse } from "@/utils/api/auth";

// "Account" section: features, render quota, e-mail
export default function AccountCards({ me }: { me: MeResponse | null }) {
  const max = me?.max_jobs ?? 0;
  const used = me ? me.done_jobs.length + me.active_jobs.length : 0;
  const atMax = me !== null && used >= max;
  const quotaPercent = max > 0 ? Math.min(100, (used / max) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle
        title="Compte"
        description="Fonctionnalités activées et quota de rendus."
      />
      <div className="grid grid-cols-2 gap-3">
        {/* Features */}
        <div className={`flex flex-col gap-3 ${PANEL}`}>
          <span className="text-sm text-muted-foreground">Fonctionnalités</span>
          {me ? (
            me.features.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {me.features.map((f) => (
                  <FeatureBadge
                    key={f}
                    label={f}
                  />
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground/60">Aucune</span>
            )
          ) : (
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          )}
        </div>

        {/* Quota */}
        <div className={`flex flex-col gap-3 ${PANEL}`}>
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
      </div>

      {/* E-mail (hidden if the account doesn't have one) */}
      {(me === null || me.email) && (
        <div className={`flex flex-col gap-2 ${PANEL}`}>
          <span className="text-sm text-muted-foreground">Email</span>
          {me ? (
            <span className="text-sm font-medium">{me.email}</span>
          ) : (
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          )}
        </div>
      )}
    </div>
  );
}
