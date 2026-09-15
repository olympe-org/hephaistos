import FullWidthWordmark from "./FullWidthWordmark";
import { CONTAINER } from "./shared";

// iOS Safari handles opening a new tab poorly: stay in the same one
const IS_MOBILE_SAFARI =
  /iP(hone|ad|od)/.test(navigator.userAgent) &&
  /WebKit/.test(navigator.userAgent) &&
  !/CriOS|FxiOS|OPiOS/.test(navigator.userAgent);

export default function Footer() {
  return (
    <footer className="mt-12 border-border lg:mt-16">
      <div className={`${CONTAINER} pt-10 pb-6 lg:pt-14 lg:pb-8`}>
        <FullWidthWordmark text="Vexia Studio" />
      </div>

      <div className="border-t border-border">
        <div
          className={`${CONTAINER} flex flex-col items-center justify-between gap-6 py-8 sm:flex-row`}
        >
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <span className="flex items-center gap-1.5">
              <span className="text-base font-black uppercase tracking-tight leading-none">
                Vexia
              </span>
              <span className="mb-2 size-1.5 shrink-0 rounded-full bg-violet-400" />
            </span>
            <p className="text-sm text-muted-foreground">
              Générateur de vidéos short-form
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Développé par{" "}
            <a
              href="https://anthony-ringressi.fr"
              target={IS_MOBILE_SAFARI ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Anthony Ringressi
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
