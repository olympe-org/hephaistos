import { useEffect, useState, type ReactNode } from "react";
import FittedDuration from "@/components/FittedDuration";
import LoginCard from "@/components/LoginCard";
import TemplatePreview from "@/components/TemplatePreview";
import { getPublicMetrics, type PublicMetrics } from "@/utils/api/render";
import { templates } from "@/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CARD_SURFACE } from "@/lib/tokens";
import { fmt, NBSP } from "./home/shared";

export default function Login() {
  usePageMeta({
    title: "Connexion · Vexia",
    description:
      "Connecte-toi à Vexia pour créer et gérer tes vidéos short-form.",
    path: "/login",
  });

  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);

  useEffect(() => {
    getPublicMetrics()
      .then(setMetrics)
      .catch(() => {});
  }, []);

  const stats: { value: ReactNode; label: string }[] = [
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
    <section className="flex min-h-[calc(100vh-var(--nav-h))] gap-10 px-6 pt-2 pb-8 lg:px-10">
      {/* Left — echoes the home page */}
      <div
        className={`relative hidden flex-1 flex-col justify-between overflow-hidden p-10 lg:flex xl:p-12 ${CARD_SURFACE}`}
      >
        <div className="pointer-events-none absolute inset-x-16 top-1/3 h-72 rounded-full bg-muted blur-3xl dark:bg-white/5" />
        <div className="relative flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">Vexia Studio</span>
          <h2 className="max-w-lg text-[clamp(1.9rem,2.8vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-balance">
            Des vidéos{" "}
            <span className="text-violet-500 dark:text-violet-400">
              short-form
            </span>
            , prêtes à publier.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
            Choisis un template, colle tes liens YouTube, règle le style. Vexia
            télécharge, découpe et assemble ta vidéo en 9:16.
          </p>
        </div>

        <div className="no-scrollbar relative -mx-10 my-8 flex flex-1 items-center gap-4 overflow-x-auto px-10 xl:-mx-12 xl:gap-5 xl:px-12">
          {templates.map((t) => (
            <div
              key={t.label}
              className="relative h-[clamp(200px,32vh,300px)] shrink-0 aspect-9/16"
            >
              <div className="size-full overflow-hidden rounded-[18px] bg-black shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/10 dark:ring-white/10">
                <TemplatePreview
                  mode="fake"
                  templateOverride={t.label}
                />
              </div>
              <span className="absolute -bottom-2 -left-2 -rotate-3 rounded-full border border-neutral-950 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wider text-neutral-950 uppercase shadow-sm">
                {t.label}
              </span>
            </div>
          ))}
        </div>

        <div className="relative grid grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col gap-1.5"
            >
              <span className="text-[1.75rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                {value}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — formulaire */}
      <div className="flex w-full flex-col items-center justify-center lg:w-110 lg:shrink-0 xl:w-120">
        <LoginCard />
      </div>
    </section>
  );
}
