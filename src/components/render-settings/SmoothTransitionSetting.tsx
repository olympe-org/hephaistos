import { useAppDispatch, useAppSelector } from "@/store";
import { setSmoothTransition } from "@/store/createVideoSlice";
import { Switch } from "../ui/switch";
import { Field, SettingCard, UnitInput } from "./SettingCard";

export default function SmoothTransitionSetting() {
  const dispatch = useAppDispatch();
  const smoothTransition = useAppSelector((s) => s.createVideo.smoothTransition);

  return (
    <SettingCard
      label="Transition douce"
      hint="Fondu enchaîné entre les extraits."
      toggle={
        <Switch
          checked={smoothTransition.active}
          onCheckedChange={(c) => dispatch(setSmoothTransition({ active: c }))}
        />
      }
    >
      {smoothTransition.active && (
        <Field label="Durée du fondu">
          <UnitInput
            unit="s"
            type="number"
            min={0.1}
            max={2}
            step={0.1}
            value={smoothTransition.duration}
            onChange={(e) =>
              dispatch(setSmoothTransition({ duration: Number(e.target.value) }))
            }
          />
        </Field>
      )}
    </SettingCard>
  );
}
