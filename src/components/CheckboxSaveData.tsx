import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "./ui/checkbox";
import SectionTitle from "./SectionTitle";
import { setSaveStep1Checked, setSaveStep2Checked } from "@/store/createVideoSlice";
import type { RootState } from "@/store";
import { PANEL } from "@/lib/tokens";

export default function CheckboxSaveData({ target }: { target: "step1" | "step2" }) {
  const dispatch = useDispatch();
  const checked = useSelector((state: RootState) =>
    target === "step1"
      ? state.createVideo.saveStep1Checked
      : state.createVideo.saveStep2Checked
  );

  const handleChange = (val: boolean) => {
    if (target === "step1") dispatch(setSaveStep1Checked(val));
    else dispatch(setSaveStep2Checked(val));
  };

  const id = `toggle-checkbox-save-${target}`;

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle
        title="Sauvegarde"
        description={
          target === "step1"
            ? "Garde le template et le mode comme point de départ de ta prochaine vidéo."
            : "Garde les styles et les paramètres de rendu comme point de départ pour ce template."
        }
      />
      {/* Toute la carte est cliquable : le label englobe la case */}
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-center justify-between gap-6 transition-colors hover:bg-muted/50 has-data-checked:bg-muted/60 ${PANEL}`}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold">
            Enregistrer comme valeurs par défaut
          </span>
          <span className="text-xs text-muted-foreground">
            {target === "step1"
              ? "Template et mode sélectionnés."
              : "Styles, polices, couleurs et paramètres de rendu de ce template."}
          </span>
        </span>
        <Checkbox
          id={id}
          name={id}
          checked={checked}
          onCheckedChange={(val) => handleChange(val === true)}
          className="size-5 shrink-0 rounded-md"
        />
      </label>
    </section>
  );
}
