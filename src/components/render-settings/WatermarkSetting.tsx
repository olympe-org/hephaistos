import ColorSwatchInput from "../ColorSwatchInput";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { useAppDispatch, useAppSelector } from "@/store";
import { setWatermark } from "@/store/createVideoSlice";
import { FONTS } from "./fonts";
import { Field, SettingCard, UnitInput } from "./SettingCard";

export default function WatermarkSetting() {
  const dispatch = useAppDispatch();
  const watermark = useAppSelector((s) => s.createVideo.watermark);

  return (
    <SettingCard
      className="md:col-span-2"
      label="Filigrane"
      hint="Texte affiché en bas de la vidéo."
      toggle={
        <Switch
          checked={watermark.active}
          onCheckedChange={(c) => dispatch(setWatermark({ active: c }))}
        />
      }
    >
      {watermark.active && (
        <div className="grid gap-4 md:grid-cols-4">
          <Field
            label="Texte"
            className="md:col-span-2"
          >
            <Input
              value={watermark.text}
              onChange={(e) => dispatch(setWatermark({ text: e.target.value }))}
              placeholder="@moncompte"
            />
          </Field>
          <Field label="Police">
            <Select
              value={watermark.font}
              onValueChange={(v) => dispatch(setWatermark({ font: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem
                    key={f.value}
                    value={f.value}
                  >
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Taille">
            <UnitInput
              unit="px"
              type="number"
              min={10}
              value={watermark.size}
              onChange={(e) => dispatch(setWatermark({ size: Number(e.target.value) }))}
            />
          </Field>
          <Field
            label="Couleur"
            className="md:col-span-2"
          >
            <ColorSwatchInput
              value={watermark.color}
              onChange={(v) => dispatch(setWatermark({ color: v }))}
            />
          </Field>
          <Field label="Opacité">
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={watermark.opacity}
              onChange={(e) => dispatch(setWatermark({ opacity: Number(e.target.value) }))}
              className="tabular-nums"
            />
          </Field>
        </div>
      )}
    </SettingCard>
  );
}
