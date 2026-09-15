import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// ─── Conversions ──────────────────────────────────────────────────────────────

interface Hsv {
  h: number; // 0–360
  s: number; // 0–1
  v: number; // 0–1
}

function hexToHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: Hsv): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return (
    "#" +
    [r, g, b]
      .map((ch) => Math.round((ch + m) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

const PRESETS = [
  "#ffffff",
  "#000000",
  "#9ca3af",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

// ─── Panel ────────────────────────────────────────────────────────────────────

function ColorPickerPanel({
  hex,
  onChange,
}: {
  hex: string;
  onChange: (hex: string) => void;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(hex));

  // Resync from the outside, unless the hex already matches local state
  // (otherwise the hue would be lost at zero saturation or brightness).
  const [syncedHex, setSyncedHex] = useState(hex);
  if (hex !== syncedHex) {
    setSyncedHex(hex);
    if (hsvToHex(hsv).toLowerCase() !== hex.toLowerCase()) setHsv(hexToHsv(hex));
  }

  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const commit = (next: Hsv) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const pickArea = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = areaRef.current!.getBoundingClientRect();
    commit({
      ...hsv,
      s: clamp((e.clientX - rect.left) / rect.width),
      v: 1 - clamp((e.clientY - rect.top) / rect.height),
    });
  };

  const pickHue = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = hueRef.current!.getBoundingClientRect();
    commit({ ...hsv, h: clamp((e.clientX - rect.left) / rect.width) * 360 });
  };

  const current = hsvToHex(hsv);
  const pureHue = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Saturation / brightness */}
      <div
        ref={areaRef}
        className="relative h-36 w-full cursor-crosshair touch-none overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/10"
        style={{
          backgroundColor: pureHue,
          backgroundImage:
            "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          pickArea(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons & 1) pickArea(e);
        }}
      >
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: current,
          }}
        />
      </div>

      {/* Hue */}
      <div
        ref={hueRef}
        className="relative h-3 w-full cursor-pointer touch-none rounded-full ring-1 ring-black/10 dark:ring-white/10"
        style={{
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          pickHue(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons & 1) pickHue(e);
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: pureHue }}
        />
      </div>

      {/* Presets + preview */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-label={p}
              title={p}
              onClick={() => commit(hexToHsv(p))}
              className={`size-5 rounded-full ring-1 ring-black/15 transition-transform hover:scale-110 dark:ring-white/15 ${
                current.toLowerCase() === p ? "ring-2 ring-foreground" : ""
              }`}
              style={{ backgroundColor: p }}
            />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="size-6 rounded-lg ring-1 ring-black/10 dark:ring-white/10"
            style={{ backgroundColor: current }}
          />
          <span className="font-mono text-xs text-muted-foreground uppercase tabular-nums">
            {current}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Trigger (pastille) + popover ─────────────────────────────────────────────

export default function ColorPickerTrigger({
  hex,
  onChange,
  className = "",
}: {
  hex: string;
  onChange: (hex: string) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Choisir une couleur"
          title="Choisir une couleur"
          className={`relative size-9 shrink-0 overflow-hidden rounded-xl border border-border transition-shadow hover:ring-2 hover:ring-foreground/20 ${className}`}
          style={{ backgroundColor: hex }}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="w-64 max-h-(--radix-popover-content-available-height) overflow-y-auto p-3"
      >
        <ColorPickerPanel
          hex={hex}
          onChange={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}
