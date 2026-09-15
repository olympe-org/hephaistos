import { ArrowRightIcon } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { CONTAINER, DARK_CARD } from "./shared";

export default function CtaSection({
  isLoggedIn,
  onStart,
}: {
  isLoggedIn: boolean;
  onStart: () => void;
}) {
  return (
    <section className={`${CONTAINER} py-8 lg:py-12`}>
      <FadeIn>
        <div className={`${DARK_CARD} px-6 py-20 text-center lg:py-28`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(139,92,246,0.35),transparent_70%)]" />
          <div className="relative flex flex-col items-center gap-6">
            <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance">
              Ta prochaine vidéo, en quelques minutes.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-white/60 lg:text-lg">
              Choisis un template, colle tes liens, lance le rendu. Ta vidéo est
              prête à publier.
            </p>
            {/* L'app n'est utilisable que sur ordinateur : bouton en desktop, mention en mobile */}
            <Button
              className="mt-2 hidden h-12 rounded-full bg-white px-7 text-[15px] text-neutral-950 hover:bg-white/90 lg:inline-flex"
              onClick={onStart}
            >
              {isLoggedIn ? "Créer une vidéo" : "Se connecter"}
              <ArrowRightIcon className="size-4" />
            </Button>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 lg:hidden">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white/70">
                Disponible uniquement sur ordinateur
              </span>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
