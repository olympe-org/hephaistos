import { DatabaseIcon, FileJsonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_TITLES = ["Template & mode", "Données & paramètres", "Rendu"];

// Header for the main column: "Step n of 3" + title, and at step 2 the
// import shortcuts (Billions Club, JSON) depending on the account's features
export default function StepHeader({
  currentStep,
  userFeatures,
  onOpenBillionsClub,
  onOpenImportJson,
}: {
  currentStep: number;
  userFeatures: string[];
  onOpenBillionsClub: () => void;
  onOpenImportJson: () => void;
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 pt-2 pb-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">
          Étape {currentStep} sur 3
        </span>
        <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
          {STEP_TITLES[currentStep - 1]}
        </h1>
      </div>
      {currentStep === 2 && (
        <div className="flex items-center gap-2 pt-1">
          {userFeatures.includes("billionsClub") && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-full px-4 text-sm"
              onClick={onOpenBillionsClub}
            >
              <DatabaseIcon className="size-3.5" />
              Billions Club
            </Button>
          )}
          {userFeatures.includes("json") && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-full px-4 text-sm"
              onClick={onOpenImportJson}
            >
              <FileJsonIcon className="size-3.5" />
              Importer JSON
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
