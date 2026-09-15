import { useState } from "react";
import { PaletteIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import IconAction from "./IconAction";
import ColorPickerTrigger from "./ColorPicker";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StyleBase {
  border: number;
  color: string; // "0xRRGGBB" | "video"
  font: string;
  size: number;
}

export interface StyleExtended extends StyleBase {
  animation: string;
  position: "left" | "center";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONTS = [
  { label: "Bebas Neue", value: "bebas" },
  { label: "DejaVu Sans", value: "dejavu" },
  { label: "Inter", value: "inter" },
  { label: "Inter Medium", value: "inter-medium" },
  { label: "Inter SemiBold", value: "inter-semibold" },
  { label: "Montserrat", value: "montserrat" },
  { label: "Montserrat Light", value: "montserrat-light" },
  { label: "Montserrat Medium", value: "montserrat-medium" },
  { label: "Helvetica", value: "helvetica" },
  { label: "Helvetica Bold", value: "helvetica-bold" },
  { label: "Helvetica Black", value: "helvetica-black" },
];

const ANIMATIONS = [
  { label: "Aucune", value: "none" },
  { label: "Fondu", value: "fade" },
  { label: "Machine à écrire", value: "typewriter" },
  { label: "Glissement gauche", value: "slide-left" },
  { label: "Glissement bas", value: "slide-bottom" },
];

const POSITIONS = [
  { label: "Gauche", value: "left" },
  { label: "Centre", value: "center" },
];

const COLOR_PRESETS = [
  { label: "Blanc", value: "0xFFFFFF" },
  { label: "Noir", value: "0x000000" },
  { label: "Personnalisé", value: "custom" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storeToHex(color: string): string {
  if (!color.startsWith("0x")) return "#ffffff";
  return "#" + color.slice(2).toLowerCase();
}

function hexToStore(hex: string): string {
  return "0x" + hex.slice(1).toUpperCase();
}

function getPresetKey(color: string): string {
  if (color === "0xFFFFFF" || color === "0xffffff") return "0xFFFFFF";
  if (color === "0x000000") return "0x000000";
  return "custom";
}

function isExtended(style: StyleBase | StyleExtended): style is StyleExtended {
  return "animation" in style;
}

// ─── UI bits ──────────────────────────────────────────────────────────────────

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-border bg-background p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`h-7 rounded-lg px-2 text-xs font-medium transition-colors ${
            value === o.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StylePopover<T extends StyleBase>({
  label,
  style,
  onChange,
  onApplyAll,
}: {
  label: string;
  style: T;
  onChange: (s: T) => void;
  onApplyAll?: (s: T) => void;
}) {
  const initialPreset = getPresetKey(style.color);
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [customHex, setCustomHex] = useState(
    initialPreset === "custom" ? storeToHex(style.color) : "#ffffff",
  );
  const [inputText, setInputText] = useState(
    initialPreset === "custom"
      ? hexToStore(storeToHex(style.color))
      : "0xFFFFFF",
  );

  // Sync from the outside (applyAll): compare against the previous color
  const [syncedColor, setSyncedColor] = useState(style.color);
  if (style.color !== syncedColor) {
    setSyncedColor(style.color);
    const preset = getPresetKey(style.color);
    setSelectedPreset(preset);
    if (preset === "custom") {
      const hex = storeToHex(style.color);
      setCustomHex(hex);
      setInputText(hexToStore(hex));
    }
  }

  const handleColorPreset = (value: string) => {
    setSelectedPreset(value);
    if (value === "custom") {
      onChange({ ...style, color: hexToStore(customHex) });
    } else {
      onChange({ ...style, color: value });
    }
  };

  const handlePickerChange = (hex: string) => {
    setCustomHex(hex);
    setInputText(hexToStore(hex));
    onChange({ ...style, color: hexToStore(hex) });
  };

  const handleInputText = (raw: string) => {
    setInputText(raw);
    const normalized = raw.trim().replace(/^0x/i, "#");
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      setCustomHex(normalized);
      onChange({ ...style, color: hexToStore(normalized) });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconAction
          tabIndex={-1}
          aria-label={`Style — ${label}`}
          title={`Style — ${label}`}
        >
          <PaletteIcon />
        </IconAction>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="center"
        sideOffset={8}
        collisionPadding={16}
        className="w-80 max-h-(--radix-popover-content-available-height) gap-4 overflow-y-auto"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Style</span>
          <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
        </div>

        {/* Font */}
        <Field label="Police">
          <Select
            value={style.font}
            onValueChange={(v) => onChange({ ...style, font: v })}
          >
            <SelectTrigger
              size="sm"
              className="w-full"
            >
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

        {/* Taille + Bordure */}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Taille">
            <Input
              type="number"
              min={1}
              value={style.size}
              onChange={(e) =>
                onChange({ ...style, size: Number(e.target.value) })
              }
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Bordure">
            <Input
              type="number"
              min={0}
              value={style.border}
              onChange={(e) =>
                onChange({ ...style, border: Number(e.target.value) })
              }
              className="h-8 text-sm"
            />
          </Field>
        </div>

        {/* Couleur */}
        <Field label="Couleur">
          <Segmented
            value={selectedPreset}
            options={COLOR_PRESETS}
            onChange={handleColorPreset}
          />
          {selectedPreset === "custom" && (
            <div className="mt-1 flex items-center gap-2">
              <ColorPickerTrigger
                hex={customHex}
                onChange={handlePickerChange}
                className="size-8 rounded-lg"
              />
              <Input
                value={inputText}
                onChange={(e) => handleInputText(e.target.value)}
                className="h-8 font-mono text-xs"
                placeholder="0xFFFFFF"
                spellCheck={false}
              />
            </div>
          )}
        </Field>

        {/* Animation + Position — only for extended styles */}
        {isExtended(style) && (
          <>
            <Field label="Animation">
              <Select
                value={style.animation}
                onValueChange={(v) => onChange({ ...style, animation: v } as T)}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((a) => (
                    <SelectItem
                      key={a.value}
                      value={a.value}
                      onPointerDown={() => {
                        // Same value already selected → force an onChange to retrigger the animation
                        if (isExtended(style) && style.animation === a.value) {
                          onChange({ ...style } as T);
                        }
                      }}
                    >
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Position">
              <Segmented
                value={style.position}
                options={POSITIONS}
                onChange={(v) =>
                  onChange({ ...style, position: v as "left" | "center" } as T)
                }
              />
            </Field>
          </>
        )}

        {onApplyAll && (
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-full"
            onClick={() => onApplyAll(style)}
          >
            Appliquer à tous les extraits
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
