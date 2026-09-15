import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import IconAction from "@/components/IconAction";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CARD_SURFACE } from "@/lib/tokens";
import { useTheme } from "@/utils/useTheme";
import FeatureVisual, { type FeatureVisualKind } from "./FeatureVisuals";
import { CONTAINER, H2 } from "./shared";

interface FeatureCard {
  title: string;
  pitch: string;
  visual: FeatureVisualKind;
  items: { label: string; text: string }[];
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    title: "Tes clips, en trois clics",
    pitch:
      "Un lien, une recherche ou notre base de hits : le clip arrive directement dans ton montage.",
    visual: "data",
    items: [
      { label: "Lien direct", text: "colle une URL YouTube, c'est tout." },
      {
        label: "Recherche intégrée",
        text: "trouve le bon clip sans quitter la page.",
      },
      {
        label: "Billions Club",
        text: "les titres à plus d'un milliard de streams, prêts à l'emploi.",
      },
      { label: "Import JSON", text: "pour les listes déjà préparées." },
    ],
  },
  {
    title: "Un texte qui a du style",
    pitch:
      "Titres, sous-titres, numéros : tu choisis la police, la couleur, la bordure et l'animation.",
    visual: "text",
    items: [
      { label: "11 polices", text: "de Bebas Neue à Helvetica Black." },
      {
        label: "Couleur et bordure",
        text: "du blanc pur au code hexa exact.",
      },
      {
        label: "5 animations",
        text: "fondu, machine à écrire, glissements.",
      },
      {
        label: "Un clic",
        text: "pour appliquer un style à tous les extraits.",
      },
    ],
  },
  {
    title: "Un rendu à ton image",
    pitch:
      "Fond, marges, transitions, filigrane : le montage suit tes réglages, pas l'inverse.",
    visual: "backgrounds",
    items: [
      { label: "Fond", text: "vidéo floutée, blanc, noir ou ta couleur." },
      { label: "Marges et espacements", text: "réglés au pixel." },
      {
        label: "Fondu enchaîné",
        text: "entre chaque extrait, durée au choix.",
      },
      { label: "Filigrane", text: "ton @ en bas de la vidéo." },
    ],
  },
  {
    title: "Zéro surprise au rendu",
    pitch:
      "Tu vois le résultat en 9:16 pendant que tu règles. Ce que tu vois, c'est ce que tu obtiens.",
    visual: "preview",
    items: [
      { label: "Aperçu live", text: "un rendu fidèle en 1080 × 1920." },
      { label: "Mise en avant", text: "simule l'animation clip par clip." },
      {
        label: "Réglages sauvegardés",
        text: "retrouvés d'une session à l'autre.",
      },
      {
        label: "QR code",
        text: "pour récupérer la vidéo sur ton téléphone.",
      },
    ],
  },
];

// Card: visual on the left, copy on the right (stacked on mobile)
function FeatureCardView({
  card,
  isDark,
}: {
  card: FeatureCard;
  isDark: boolean;
}) {
  return (
    <article
      className={`flex h-full flex-col gap-5 p-5 sm:flex-row sm:gap-6 sm:p-6 ${CARD_SURFACE}`}
    >
      <div className="relative h-56 shrink-0 overflow-hidden rounded-2xl bg-muted/50 sm:h-80 sm:w-104">
        <FeatureVisual
          visual={card.visual}
          isDark={isDark}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        <h3 className="text-2xl font-semibold leading-tight tracking-tight">
          {card.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {card.pitch}
        </p>
        <ul className="mt-1 flex flex-col gap-2">
          {card.items.map((it) => (
            <li
              key={it.label}
              className="flex gap-2.5 text-sm leading-relaxed"
            >
              <CheckIcon className="mt-1 size-4 shrink-0" />
              <span>
                <span className="font-medium">{it.label}</span>{" "}
                <span className="text-muted-foreground">— {it.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// Section title + carousel navigation (dots, counter, arrows)
function FeaturesHeader({
  index,
  total,
  onGoTo,
}: {
  index: number;
  total: number;
  onGoTo?: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3">
        <h2 className={H2}>Tu gardes la main sur tout</h2>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">
          Des clips au rendu final, chaque détail se règle et se voit en direct.
        </p>
      </div>
      {onGoTo && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Aller à la carte ${i + 1}`}
                onClick={() => onGoTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-foreground"
                    : "w-3 bg-border hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1.5">
            <IconAction
              aria-label="Carte précédente"
              onClick={() => onGoTo(Math.max(0, index - 1))}
              disabled={index === 0}
            >
              <ChevronLeftIcon />
            </IconAction>
            <IconAction
              aria-label="Carte suivante"
              onClick={() => onGoTo(Math.min(total - 1, index + 1))}
              disabled={index === total - 1}
            >
              <ChevronRightIcon />
            </IconAction>
          </div>
        </div>
      )}
    </div>
  );
}

// Desktop: the section pins in place and vertical scroll drives the cards
// horizontally, then the page resumes its normal flow.
function PinnedFeatures({ isDark }: { isDark: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = FEATURE_CARDS.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) return;

      // 0 → 1 based on the section's position within the page
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress =
        scrollable > 0
          ? Math.min(
              1,
              Math.max(0, -section.getBoundingClientRect().top / scrollable),
            )
          : 0;

      const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      track.style.transform = `translate3d(${-progress * maxShift}px, 0, 0)`;
      setActive(Math.min(total - 1, Math.round(progress * (total - 1))));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [total]);

  // Scrolls the page to the position that shows card i
  const goTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const scrollable = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + (i / (total - 1)) * scrollable,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      style={{ height: `${total * 70}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-24 pb-8">
        <div className={CONTAINER}>
          <FeaturesHeader
            index={active}
            total={total}
            onGoTo={goTo}
          />
        </div>
        <div className={`${CONTAINER} mt-8`}>
          {/* Content area (no padding): used as the reference for the scroll distance */}
          <div ref={viewportRef}>
            <div
              ref={trackRef}
              className="flex w-max gap-6 will-change-transform"
            >
              {FEATURE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="w-205 xl:w-215"
                >
                  <FeatureCardView
                    card={card}
                    isDark={isDark}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mobile / reduced motion: native swipe carousel.
function SwipeFeatures({ isDark }: { isDark: boolean }) {
  return (
    <section className={`${CONTAINER} py-20 lg:py-28`}>
      <FadeIn>
        <FeaturesHeader
          index={0}
          total={FEATURE_CARDS.length}
        />
      </FadeIn>
      <div className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.title}
            className="w-[85vw] max-w-190 shrink-0 snap-center"
          >
            <FeatureCardView
              card={card}
              isDark={isDark}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function FeaturesSection() {
  const { isDark } = useTheme();
  const pinned = useMediaQuery(
    "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  );

  return pinned ? (
    <PinnedFeatures isDark={isDark} />
  ) : (
    <SwipeFeatures isDark={isDark} />
  );
}
