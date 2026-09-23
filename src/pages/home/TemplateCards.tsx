import TemplatePreview from "@/components/TemplatePreview";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CARD_SURFACE } from "@/lib/tokens";
import { templates } from "@/utils";

const TEMPLATE_TITLES: Record<string, string> = {
  top: "Pour les classements",
  classic: "Titre global, vidéo centrée",
  minimal: "La vidéo avant tout",
  expanded: "Plein écran, impact maximal",
};

// The 4 templates as cards — hidden on mobile, where a cramped single card
// per row wouldn't do them justice anyway
export default function TemplateCards() {
  const wide = useMediaQuery("(min-width: 640px)");
  if (!wide) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {templates.map((t) => (
        <article
          key={t.label}
          className={`flex flex-col gap-6 p-6 ${CARD_SURFACE}`}
        >
          <div className="relative flex justify-center pt-2">
            <div className="pointer-events-none absolute inset-x-4 top-8 h-56 rounded-full bg-muted blur-2xl dark:bg-white/5" />
            <div className="relative aspect-9/16 h-70 overflow-hidden rounded-[18px] bg-black shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10 dark:ring-white/10">
              <TemplatePreview
                mode="fake"
                templateOverride={t.label}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="w-fit -rotate-3 rounded-full border border-neutral-950 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-950">
              {t.label}
            </span>
            <h3 className="text-2xl font-semibold leading-tight tracking-tight">
              {TEMPLATE_TITLES[t.label] ?? t.label}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
