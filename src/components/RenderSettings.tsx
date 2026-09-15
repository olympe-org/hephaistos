import { useAppSelector } from "@/store";
import BackgroundSetting from "./render-settings/BackgroundSetting";
import HighlightActiveSetting from "./render-settings/HighlightActiveSetting";
import SmoothTransitionSetting from "./render-settings/SmoothTransitionSetting";
import SpacingSetting from "./render-settings/SpacingSetting";
import VideoMarginSetting from "./render-settings/VideoMarginSetting";
import WatermarkSetting from "./render-settings/WatermarkSetting";

// Render settings: each card only appears if the active template offers it
export default function RenderSettings() {
  const features = useAppSelector((s) => s.createVideo.templateFeatures);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {features.includes("background") && <BackgroundSetting />}
      {features.includes("videoMargin") && <VideoMarginSetting />}
      {features.includes("spacing") && <SpacingSetting />}
      {features.includes("smoothTransition") && <SmoothTransitionSetting />}
      {features.includes("highlightActive") && <HighlightActiveSetting />}
      {features.includes("watermark") && <WatermarkSetting />}
    </div>
  );
}
