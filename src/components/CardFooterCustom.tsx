import type { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "./ui/button";

const TOTAL_STEPS = 3;

type Props = {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showPrev?: boolean;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
};

export default function CardFooterCustom({
  currentStep,
  onPrev,
  onNext,
  nextLabel,
  nextDisabled,
  showPrev,
  leftAction,
  rightAction,
}: Props) {
  const label = nextLabel ?? "Suivant";
  const prevVisible = showPrev !== undefined ? showPrev : currentStep > 1;

  return (
    <div className="grid shrink-0 grid-cols-3 items-center py-4">
      {/* Left */}
      <div className="flex justify-start">
        {leftAction ?? (
          <Button
            variant="ghost"
            onClick={onPrev}
            className={`h-10 rounded-full px-4 ${!prevVisible ? "invisible" : ""}`}
          >
            Retour
          </Button>
        )}
      </div>

      {/* Center — always centered */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 === currentStep
                ? "w-5 bg-foreground"
                : i + 1 < currentStep
                  ? "w-1.5 bg-foreground/40"
                  : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Right */}
      <div className="flex justify-end">
        {rightAction ?? (
          <Button
            onClick={onNext}
            disabled={nextDisabled}
            className="h-10 rounded-full px-5"
          >
            {label}
            <ArrowRightIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
