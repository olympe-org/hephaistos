import ColorSwatchInput from "../ColorSwatchInput";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useAppDispatch, useAppSelector } from "@/store";
import { setHighlightActive, setHighlightPreviewActiveIndex } from "@/store/createVideoSlice";
import { Field, SettingCard } from "./SettingCard";

// Display duration of each clip when previewing the highlight effect
const PREVIEW_STEP_MS = 2000;

export default function HighlightActiveSetting() {
  const dispatch = useAppDispatch();
  const highlightActive = useAppSelector((s) => s.createVideo.highlightActive);
  const clipCount = useAppSelector((s) => s.createVideo.clips.length);

  // Replays in the preview the successive dimming of each clip, from last to
  // first (the "top" template shows the last clip at the top of the list)
  const previewHighlight = () => {
    for (let i = clipCount - 1; i >= 0; i--) {
      const step = clipCount - 1 - i;
      setTimeout(() => dispatch(setHighlightPreviewActiveIndex(i)), step * PREVIEW_STEP_MS);
    }
    setTimeout(
      () => dispatch(setHighlightPreviewActiveIndex(null)),
      clipCount * PREVIEW_STEP_MS,
    );
  };

  return (
    <SettingCard
      label="Mise en avant du clip actif"
      hint="Grise les autres titres pendant chaque extrait."
      toggle={
        <Switch
          checked={highlightActive.active}
          onCheckedChange={(c) => dispatch(setHighlightActive({ active: c }))}
        />
      }
    >
      {highlightActive.active && (
        <>
          <Field label="Couleur des clips inactifs">
            <ColorSwatchInput
              value={highlightActive.inactiveColor}
              onChange={(v) => dispatch(setHighlightActive({ inactiveColor: v }))}
            />
          </Field>
          <Button
            variant="outline"
            className="h-9 w-fit rounded-full px-4"
            onClick={previewHighlight}
          >
            Prévisualiser dans l'aperçu
          </Button>
        </>
      )}
    </SettingCard>
  );
}
