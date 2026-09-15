import { useAppDispatch, useAppSelector } from "@/store";
import { setSpacing } from "@/store/createVideoSlice";
import { SettingCard, UnitInput } from "./SettingCard";

export default function SpacingSetting() {
  const dispatch = useAppDispatch();
  const spacing = useAppSelector((s) => s.createVideo.spacing);

  return (
    <SettingCard
      label="Espacement titres / vidéo"
      hint="Distance entre le texte et la vidéo."
    >
      <UnitInput
        unit="px"
        type="number"
        min={0}
        value={spacing}
        onChange={(e) => dispatch(setSpacing(Number(e.target.value)))}
      />
    </SettingCard>
  );
}
