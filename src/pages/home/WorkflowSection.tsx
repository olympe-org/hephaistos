import { useEffect, useState } from "react";
import FadeIn from "@/components/FadeIn";
import TemplatePreview from "@/components/TemplatePreview";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TILE } from "@/lib/tokens";
import { templates } from "@/utils";
import { useTheme } from "@/utils/useTheme";
import { CONTAINER, H2, NBSP } from "./shared";
import youtubePreviewDark from "/images/preview-youtube-dark.png";
import youtubePreviewLight from "/images/preview-youtube-light.png";
import configurationPreviewDark from "/images/preview-configuration-dark.png";
import configurationPreviewLight from "/images/preview-configuration-light.png";
import downloadPreviewDark from "/images/preview-download-dark.png";
import downloadPreviewLight from "/images/preview-download-light.png";

interface Step {
  step: string;
  title: string;
  description: string;
  // Without an image, the step shows the interactive template switcher
  image?: { light: string; dark: string; align: "contain" | "center" };
}

const STEPS: Step[] = [
  {
    step: "01",
    title: "Choisis ton template",
    description:
      "Quatre templates, chacun pensé pour un style de contenu" +
      NBSP +
      ": Top, Classic, Minimal ou Expanded. L'aperçu se met à jour à chaque changement.",
  },
  {
    step: "02",
    title: "Configure tes données",
    description:
      "Remplis les champs, importe un JSON ou pioche dans la base Billions Club, qui réunit toutes les musiques Spotify à plus d'un milliard d'écoutes. Chaque modification se prévisualise en temps réel.",
    image: {
      light: configurationPreviewLight,
      dark: configurationPreviewDark,
      align: "contain",
    },
  },
  {
    step: "03",
    title: "Ajoute tes sources vidéo",
    description:
      "Colle n'importe quel lien vidéo ou utilise la recherche YouTube intégrée pour trouver le bon extrait sans quitter la page.",
    image: {
      light: youtubePreviewLight,
      dark: youtubePreviewDark,
      align: "center",
    },
  },
  {
    step: "04",
    title: "Lance le rendu",
    description:
      "Le serveur télécharge, découpe et assemble ta vidéo. Tu suis la progression en direct, puis tu la télécharges ou tu scannes le QR code pour la récupérer sur ton téléphone.",
    image: {
      light: downloadPreviewLight,
      dark: downloadPreviewDark,
      align: "contain",
    },
  },
];

// Time each step stays on screen before moving to the next one
const STEP_DURATION = 7000;

// Line that fills up over STEP_DURATION under the active step
function ProgressLine({
  duration,
  className = "",
}: {
  duration: number;
  className?: string;
}) {
  const [run, setRun] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRun(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span className={`block h-px overflow-hidden bg-border ${className}`}>
      <span
        className="block h-full bg-foreground"
        style={{
          width: run ? "100%" : "0%",
          transition: `width ${duration}ms linear`,
        }}
      />
    </span>
  );
}

// Phone + pills to switch from one template to another
function TemplateSwitcher({
  phoneClass,
  onSelect,
}: {
  phoneClass: string;
  onSelect?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const t = templates[idx];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 sm:p-8">
      <div
        className={`aspect-[9/16] overflow-hidden rounded-[20px] bg-black shadow-2xl ring-1 ring-black/10 dark:ring-white/10 ${phoneClass}`}
      >
        <TemplatePreview
          mode="fake"
          templateOverride={t.label}
        />
      </div>
      <div className="flex gap-1 rounded-full border border-border bg-background p-1">
        {templates.map((tt, i) => (
          <button
            key={tt.label}
            type="button"
            onClick={() => {
              setIdx(i);
              onSelect?.();
            }}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium capitalize transition-colors sm:px-4 sm:text-sm ${
              i === idx
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tt.label}
          </button>
        ))}
      </div>
      <p className="line-clamp-2 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
        {t.description}
      </p>
    </div>
  );
}

// Right-hand visual (desktop): a screenshot of the step, or the template switcher
function StepVisual({
  step,
  isDark,
  onInteract,
}: {
  step: Step;
  isDark: boolean;
  onInteract?: () => void;
}) {
  if (!step.image)
    return (
      <TemplateSwitcher
        phoneClass="h-[340px] xl:h-[360px]"
        onSelect={onInteract}
      />
    );

  return (
    <img
      src={isDark ? step.image.dark : step.image.light}
      alt={step.title}
      className={`absolute max-w-none rounded-xl border border-border shadow-2xl animate-in fade-in duration-500 ${
        step.image.align === "center"
          ? "top-[8%] left-1/2 w-[124%] -translate-x-1/2"
          : "top-1/2 left-[5%] w-[90%] -translate-y-1/2"
      }`}
    />
  );
}

export default function WorkflowSection() {
  const { isDark } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [active, setActive] = useState(0);
  // Incremented on every interaction to restart the timer from zero
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a + 1) % STEPS.length),
      STEP_DURATION,
    );
    return () => clearInterval(id);
  }, [cycle]);

  const select = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
  };

  return (
    <section
      id="workflow"
      className={`${CONTAINER} scroll-mt-20 py-20 lg:py-28`}
    >
      <FadeIn>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className={H2}>Comment ça marche</h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">
            Quatre étapes, quelques minutes. Tout se passe dans le navigateur,
            le rendu tourne côté serveur.
          </p>
        </div>
      </FadeIn>

      {isDesktop ? (
        <FadeIn className="mt-14">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden rounded-[32px] border border-border bg-muted/20">
            {/* List of steps */}
            <div className="flex flex-col justify-center gap-1 p-12">
              {STEPS.map((s, i) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => select(i)}
                  aria-current={i === active ? "step" : undefined}
                  className="group flex w-full flex-col items-start py-4 text-left"
                >
                  <span className="flex items-baseline gap-5">
                    <span
                      className={`w-6 text-sm tabular-nums transition-colors ${
                        i === active
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {s.step}
                    </span>
                    <span
                      className={`text-2xl font-medium tracking-tight transition-colors xl:text-[28px] ${
                        i === active
                          ? "text-foreground"
                          : "text-muted-foreground/50 group-hover:text-muted-foreground"
                      }`}
                    >
                      {s.title}
                    </span>
                  </span>
                  {i === active && (
                    <>
                      <span className="mt-3 block pl-11 text-[15px] leading-relaxed text-muted-foreground animate-in fade-in duration-500">
                        {s.description}
                      </span>
                      <ProgressLine
                        key={`${active}-${cycle}`}
                        duration={STEP_DURATION}
                        className="mt-5 ml-11 w-[calc(100%-2.75rem)]"
                      />
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Visual for the active step */}
            <div className={`relative h-[560px] overflow-hidden ${TILE}`}>
              <StepVisual
                key={active}
                step={STEPS[active]}
                isDark={isDark}
                onInteract={() => setCycle((c) => c + 1)}
              />
            </div>
          </div>
        </FadeIn>
      ) : (
        <div className="mt-10 flex flex-col gap-14">
          {STEPS.map((s) => (
            <FadeIn key={s.step}>
              <article className="flex flex-col gap-3">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {s.step}
                </span>
                <h3 className="text-2xl font-medium tracking-tight">
                  {s.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <div
                  className={`mt-3 overflow-hidden rounded-2xl border border-border ${TILE}`}
                >
                  {s.image ? (
                    <div className="p-4">
                      <img
                        src={isDark ? s.image.dark : s.image.light}
                        alt={s.title}
                        className="w-full rounded-lg border border-border shadow-lg"
                      />
                    </div>
                  ) : (
                    <TemplateSwitcher phoneClass="h-[300px]" />
                  )}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
