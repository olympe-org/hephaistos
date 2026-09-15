import { useDispatch, useSelector } from "react-redux";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { capitalize } from "@/utils";
import { setModeValue } from "@/store/createVideoSlice";
import type { RootState } from "@/store";
import { cn } from "@/lib/utils";

export default function SelectMode() {
  const dispatch = useDispatch();
  const modeValue = useSelector(
    (state: RootState) => state.createVideo.modeValue,
  );

  const modeData = [
    {
      label: "default",
      hint: "Enchaînement direct",
      description:
        "Les extraits s'enchaînent avec le titre et la vidéo visible dès le départ.",
    },
    {
      label: "blind-test",
      hint: "Compte à rebours",
      description:
        "Le clip est masqué quelques secondes et un compteur apparaît, puis le clip se révèle. Durée minimum de l'extrait 10 secondes.",
    },
  ];

  const handleValueChange = (value: string) => {
    dispatch(setModeValue(value));
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Mode</h2>
        <p className="text-sm text-muted-foreground">
          Enchaînement classique ou blind test avec compte à rebours.
        </p>
      </div>

      <RadioGroup
        value={modeValue}
        className="gap-0 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
        onValueChange={handleValueChange}
      >
        {modeData.map((mode) => {
          const selected = mode.label === modeValue;
          return (
            <label
              key={mode.label}
              htmlFor={`${mode.label}-plan`}
              className={cn(
                "flex cursor-pointer items-center gap-5 p-4 transition-colors",
                selected ? "bg-muted/60" : "hover:bg-muted/40",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">
                    {capitalize(mode.label)}
                  </span>
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {mode.hint}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {mode.description}
                </p>
              </div>
              <RadioGroupItem
                value={mode.label}
                id={`${mode.label}-plan`}
                className="size-5 shrink-0"
              />
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
