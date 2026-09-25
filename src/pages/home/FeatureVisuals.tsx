import { CheckIcon, DatabaseIcon, LinkIcon, SearchIcon } from "lucide-react";
import TemplatePreview from "@/components/TemplatePreview";
import { FAKE_PREVIEW } from "@/utils";
import configurationPreviewDark from "/images/preview-configuration-dark.webp";
import configurationPreviewLight from "/images/preview-configuration-light.webp";

// Mini interfaces illustrating each card in the "You stay in control" section

export type FeatureVisualKind = "data" | "text" | "backgrounds" | "preview";

// The three ways to add a clip: link, search, Billions Club
function DataVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 shadow-sm">
        <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-mono text-xs text-foreground/80">
          https://www.youtube.com/watch?v=4NRXx6U8ABQ
        </span>
        <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
          Collé
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-2.5 shadow-sm">
        <div className="flex items-center gap-3 px-1">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Blinding Lights official clip
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted px-2 py-1.5">
          <img
            src={FAKE_PREVIEW.top.bgSrc}
            alt=""
            className="aspect-video w-14 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              The Weeknd – Blinding Lights (Official Video)
            </p>
            <p className="text-[11px] text-muted-foreground">
              TheWeekndVEVO · 1 Md de vues
            </p>
          </div>
          <CheckIcon className="ml-auto size-4 shrink-0" />
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 shadow-sm">
        <DatabaseIcon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">Starboy · The Weeknd</p>
          <p className="text-[11px] text-muted-foreground">
            Billions Club · 3,10 Md de streams
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
          Ajouté
        </span>
      </div>
    </div>
  );
}

// Three titles in three different fonts/styles
function TextStyleVisual() {
  return (
    <div className="relative flex h-full flex-col items-start justify-center gap-3.5 overflow-hidden bg-[#0b0b0d] p-6 text-white">
      <img
        src={FAKE_PREVIEW.top.bgSrc}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl brightness-50"
      />
      <span
        className="relative text-4xl leading-none tracking-wide"
        style={{ fontFamily: '"bebas", sans-serif' }}
      >
        TOP 5 THE WEEKND
      </span>
      <span
        className="relative text-2xl leading-none"
        style={{ fontFamily: '"montserrat", sans-serif', color: "#facc15" }}
      >
        Blinding Lights
      </span>
      <span
        className="relative text-3xl leading-none"
        style={{
          fontFamily: '"helvetica-black", sans-serif',
          WebkitTextStroke: "1.5px #000",
          paintOrder: "stroke fill",
        }}
      >
        Starboy
      </span>
      <div className="relative mt-1 flex flex-wrap gap-1.5">
        {["Bebas Neue", "Montserrat", "Helvetica Black", "+ 8 autres"].map(
          (c) => (
            <span
              key={c}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80"
            >
              {c}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

const BACKGROUNDS = [
  { label: "Vidéo floutée", background: "video" },
  { label: "Noir", background: "0x000000" },
  { label: "Blanc", background: "0xFFFFFF" },
];

// The same template with three different backgrounds
function BackgroundsVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-3 p-4">
      {BACKGROUNDS.map((b) => (
        <figure
          key={b.label}
          className="flex flex-col items-center gap-2.5"
        >
          <div className="aspect-9/16 h-44 overflow-hidden rounded-[12px] bg-black shadow-xl ring-1 ring-border">
            <TemplatePreview
              mode="fake"
              templateOverride="minimal"
              fakeOverride={{ background: b.background }}
            />
          </div>
          <figcaption className="text-[11px] text-muted-foreground">
            {b.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// Screenshot of the editor with the live preview
function PreviewVisual({ isDark }: { isDark: boolean }) {
  return (
    <img
      src={isDark ? configurationPreviewDark : configurationPreviewLight}
      alt="Prévisualisation en direct dans l'éditeur"
      className="h-full w-full object-cover object-right"
    />
  );
}

export default function FeatureVisual({
  visual,
  isDark,
}: {
  visual: FeatureVisualKind;
  isDark: boolean;
}) {
  switch (visual) {
    case "data":
      return <DataVisual />;
    case "text":
      return <TextStyleVisual />;
    case "backgrounds":
      return <BackgroundsVisual />;
    case "preview":
      return <PreviewVisual isDark={isDark} />;
  }
}
