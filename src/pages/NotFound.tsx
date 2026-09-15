import { ArrowLeftIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

// Catch-all route (see App.tsx) — same type scale, badge and button styles
// as the home hero, so a broken link still feels like the rest of the site.
export default function NotFound() {
  const { pathname } = useLocation();
  usePageMeta({ title: "Page introuvable · Vexia", path: pathname, indexable: false });

  return (
    <section className="flex min-h-[calc(100vh-var(--nav-h))] flex-col items-center justify-center px-6 text-center">
      <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 rounded-full bg-violet-400" />
        Erreur 404
      </span>

      <h1 className="text-[clamp(2.5rem,6.2vw,5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance">
        Cette page{" "}
        <span className="text-violet-500 dark:text-violet-400">
          n'existe pas
        </span>
        .
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
        Le lien est cassé ou la page a été déplacée. Retourne à l'accueil pour
        repartir de zéro.
      </p>

      <Button
        asChild
        className="mt-9 h-12 rounded-full px-7 text-[15px]"
      >
        <Link to="/">
          <ArrowLeftIcon className="size-4" />
          Retour à l'accueil
        </Link>
      </Button>
    </section>
  );
}
