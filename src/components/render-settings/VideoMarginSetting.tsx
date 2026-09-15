import { useAppDispatch, useAppSelector } from "@/store";
import { setVideoMargin } from "@/store/createVideoSlice";
import { SettingCard, UnitInput } from "./SettingCard";

export default function VideoMarginSetting() {
  const dispatch = useAppDispatch();
  const videoMargin = useAppSelector((s) => s.createVideo.videoMargin);

  return (
    <SettingCard
      label="Marge vidéo"
      hint="Espace laissé de chaque côté de la vidéo."
    >
      <UnitInput
        unit="px"
        type="number"
        min={0}
        value={videoMargin}
        onChange={(e) => dispatch(setVideoMargin(Number(e.target.value)))}
      />
    </SettingCard>
  );
}
