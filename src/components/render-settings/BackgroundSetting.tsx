import ColorSwatchInput from "../ColorSwatchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAppDispatch, useAppSelector } from "@/store";
import { setBackground } from "@/store/createVideoSlice";
import { Field, SettingCard } from "./SettingCard";

// background is stored as either "video" or "0xRRGGBB"
function toSelectValue(background: string): "video" | "white" | "black" | "custom" {
  if (background === "video") return "video";
  if (background === "0xFFFFFF") return "white";
  if (background === "0x000000") return "black";
  return "custom";
}

export default function BackgroundSetting() {
  const dispatch = useAppDispatch();
  const background = useAppSelector((s) => s.createVideo.background);
  const selectValue = toSelectValue(background);

  const handleSelect = (value: string) => {
    if (value === "video") dispatch(setBackground("video"));
    else if (value === "white") dispatch(setBackground("0xFFFFFF"));
    else if (value === "black") dispatch(setBackground("0x000000"));
    // "custom": keep the already-chosen color, or a starting value
    else dispatch(setBackground(selectValue === "custom" ? background : "0x3A3A3A"));
  };

  return (
    <SettingCard
      label="Fond"
      hint="Autour de la vidéo quand elle ne remplit pas l'écran."
    >
      <Select
        value={selectValue}
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="video">Vidéo (floutée)</SelectItem>
          <SelectItem value="white">Blanc</SelectItem>
          <SelectItem value="black">Noir</SelectItem>
          <SelectItem value="custom">Personnalisé</SelectItem>
        </SelectContent>
      </Select>
      {selectValue === "custom" && (
        <Field label="Code couleur">
          <ColorSwatchInput
            value={background}
            onChange={(v) => dispatch(setBackground(v))}
          />
        </Field>
      )}
    </SettingCard>
  );
}
