import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TemplateCards from "./TemplateCards";
import { CONTAINER } from "./shared";

export type ApiStatus = "checking" | "up" | "down";

const STATUS_LABEL: Record<ApiStatus, string> = {
  checking: "Vérification de l'état des services…",
  up: "Tous les services sont opérationnels",
  down: "Service de rendu temporairement indisponible",
};

const STATUS_DOT: Record<ApiStatus, string> = {
  checking: "animate-pulse bg-muted-foreground",
  up: "bg-green-500",
  down: "bg-destructive",
};

// Staggered fade-in of the hero elements (keyframes in index.css)
const heroAnim = (delay: number): CSSProperties => ({
  animation: `hero-fade-up 0.7s ease-out ${delay}ms both`,
});

export default function HeroSection({
  apiStatus,
  isLoggedIn,
  onStart,
}: {
  apiStatus: ApiStatus;
  isLoggedIn: boolean;
  onStart: () => void;
}) {
  const navigate = useNavigate();
  const scrollToWorkflow = () =>
    document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className={`${CONTAINER} pt-16 lg:pt-24`}>
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* État des services */}
        <span
          style={heroAnim(0)}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <span className={`size-1.5 rounded-full ${STATUS_DOT[apiStatus]}`} />
          {STATUS_LABEL[apiStatus]}
        </span>

        <h1
          style={heroAnim(60)}
          className="text-[clamp(2.5rem,6.2vw,5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance"
        >
          Des vidéos{" "}
          <span className="text-violet-500 dark:text-violet-400">
            short-form
          </span>
          ,<br className="hidden md:block" /> prêtes à publier.
        </h1>
        <p
          style={heroAnim(120)}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl"
        >
          Tops, classements, meilleures scènes&nbsp;: choisis un template, colle
          tes liens YouTube et règle le style. Vexia télécharge, découpe et
          assemble ta vidéo en 9:16, prête pour TikTok, Reels et Shorts.
        </p>

        <div
          style={heroAnim(240)}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button
            className="h-12 w-full rounded-full px-7 text-[15px] sm:w-auto"
            onClick={onStart}
          >
            {isLoggedIn ? "Créer une vidéo" : "Se connecter"}
            <ArrowRightIcon className="size-4" />
          </Button>
          <Button
            variant="secondary"
            className="h-12 w-full rounded-full px-7 text-[15px] sm:w-auto"
            onClick={isLoggedIn ? () => navigate("/user") : scrollToWorkflow}
          >
            {isLoggedIn ? "Mon profil" : "Comment ça marche"}
          </Button>
        </div>
        <p
          style={heroAnim(360)}
          className="mt-5 text-sm text-muted-foreground"
        >
          Rendu en ~5&nbsp;mins · 1080&nbsp;×&nbsp;1920 · 4 templates
        </p>
      </div>

      <div
        style={heroAnim(480)}
        className="mt-14 lg:mt-20"
      >
        <TemplateCards />
      </div>
    </section>
  );
}
