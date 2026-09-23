import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

// The editor UI needs real screen space (multi-column layouts, dense
// controls), so this overlay blocks anything below "lg". Same badge/heading/
// button language as the 404 page, for consistency across every state page.
export default function MobileGuard() {
  return (
    <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-background px-6 text-center lg:hidden">
      <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 rounded-full bg-violet-400" />
        Écran trop petit
      </span>

      <h1 className="text-[clamp(1.75rem,7vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-balance">
        Vexia Studio est fait pour{" "}
        <span className="text-violet-500 dark:text-violet-400">un grand écran</span>.
      </h1>
      <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Reviens depuis un ordinateur (écran ≥ 1024px) pour accéder à toutes les fonctionnalités.
      </p>

      <Button asChild className="mt-9 h-12 rounded-full px-7 text-[15px]">
        <Link to="/">
          <ArrowLeftIcon className="size-4" />
          Retour à l'accueil
        </Link>
      </Button>
    </div>
  );
}
