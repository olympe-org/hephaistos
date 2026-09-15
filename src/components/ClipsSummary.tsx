import type { ReactNode } from "react";
import { useAppSelector } from "@/store";
import type { ClipData, GlobalTitleData } from "@/store/createVideoSlice";
import SectionTitle from "./SectionTitle";

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexColor(c: string): string {
  if (c.startsWith("0x")) return "#" + c.slice(2);
  return c.startsWith("#") ? c : "#ffffff";
}

function extractYtId(url: string): string | null {
  try { return new URL(url).searchParams.get("v"); } catch { return null; }
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full border border-black/20"
      style={{ background: hexColor(color) }}
    />
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
      {label}
    </span>
  );
}

function Card({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{title}</span>
        {badge}
      </div>
      <div className="mt-3 divide-y divide-border">{children}</div>
    </div>
  );
}

// ── Style tag row: prefix + color dot + tags ──────────────────────────────────

function StyleTagRow({
  prefix,
  color,
  font,
  size,
  border,
  animation,
  position,
}: {
  prefix: string;
  color: string;
  font: string;
  size: number;
  border?: number;
  animation?: string;
  position?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-5 shrink-0 text-[10px] font-medium text-muted-foreground/60">
        {prefix}
      </span>
      <ColorDot color={color} />
      <Tag label={font} />
      <Tag label={`${size}px`} />
      {border != null && border > 0 && <Tag label={`bord. ${border}`} />}
      {animation && animation !== "none" && <Tag label={animation} />}
      {position === "center" && <Tag label="centré" />}
    </div>
  );
}

// ── Global title ──────────────────────────────────────────────────────────────

function GlobalTitleBlock({ g }: { g: GlobalTitleData }) {
  const lines = [g.first, g.second].filter(Boolean);
  const hasSubtitle = !!g.subtitle;

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="min-w-0">
        {lines.length > 0
          ? lines.map((l, i) => <p key={i} className="truncate text-sm font-medium leading-snug">{l}</p>)
          : <p className="text-sm text-muted-foreground italic">—</p>}
        {hasSubtitle && (
          <p className="truncate text-sm leading-snug text-muted-foreground">{g.subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <StyleTagRow prefix="T" color={g.titleStyle.color} font={g.titleStyle.font} size={g.titleStyle.size} border={g.titleStyle.border} />
        {hasSubtitle && (
          <StyleTagRow prefix="S" color={g.subtitleStyle.color} font={g.subtitleStyle.font} size={g.subtitleStyle.size} border={g.subtitleStyle.border} />
        )}
      </div>
    </div>
  );
}

// ── Clip row ──────────────────────────────────────────────────────────────────

function ClipRow({ clip, index }: { clip: ClipData; index: number }) {
  const ytId = extractYtId(clip.url);
  const hasSubtitle = !!clip.subtitle;
  const hasId = !!clip.id;

  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background px-1.5 font-mono text-[11px] text-muted-foreground">
        {hasId ? clip.id : index + 1}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`truncate text-sm font-medium leading-snug ${!clip.title ? "text-muted-foreground italic" : ""}`}>
              {clip.title || "sans titre"}
            </p>
            {hasSubtitle && (
              <p className="truncate text-sm leading-snug text-muted-foreground">{clip.subtitle}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            {ytId
              ? <span className="max-w-28 truncate rounded-md bg-background px-1.5 py-0.5 font-mono ring-1 ring-border">/{ytId}</span>
              : <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 font-medium text-destructive">pas de vidéo</span>}
            {clip.start_time && clip.start_time !== "00:00:00" && (
              <span className="font-mono tabular-nums">{clip.start_time}</span>
            )}
            <span className="font-mono tabular-nums">{clip.duration}s</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {hasId && <StyleTagRow prefix="id" color={clip.idStyle.color} font={clip.idStyle.font} size={clip.idStyle.size} border={clip.idStyle.border} />}
          <StyleTagRow prefix="T" color={clip.titleStyle.color} font={clip.titleStyle.font} size={clip.titleStyle.size} border={clip.titleStyle.border} animation={clip.titleStyle.animation} position={clip.titleStyle.position} />
          {hasSubtitle && (
            <StyleTagRow prefix="S" color={clip.subtitleStyle.color} font={clip.subtitleStyle.font} size={clip.subtitleStyle.size} border={clip.subtitleStyle.border} animation={clip.subtitleStyle.animation} position={clip.subtitleStyle.position} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Render param tile ─────────────────────────────────────────────────────────
// One setting = one tile (label on top, value below), laid out in an equal-
// width grid instead of a stacked list — see the "Rendu" card below.

function ParamRow({
  label,
  value,
  dot,
  tags,
}: {
  label: string;
  value: string;
  dot?: string;
  // Extra details shown as small tags on their own line (e.g. font/size/opacity for the watermark)
  tags?: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
        <div className="flex min-w-0 items-center gap-1.5">
          {dot && <ColorDot color={dot} />}
          <span className="truncate text-sm font-medium">{value}</span>
        </div>
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1">
          {tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ClipsSummary() {
  const {
    clips, globalTitle, templateFeatures,
    background, videoMargin, spacing, smoothTransition, watermark, highlightActive,
  } = useAppSelector((s) => s.createVideo);

  const hasGlobalTitle = templateFeatures.includes("globalTitle");
  const showGlobalTitle = hasGlobalTitle && (!!globalTitle.first || !!globalTitle.second || !!globalTitle.subtitle);

  const bgLabel =
    background === "video" ? "Vidéo floutée"
    : background === "0xFFFFFF" ? "Blanc"
    : background === "0x000000" ? "Noir"
    : hexColor(background);

  const missingVideo = clips.filter((c) => !extractYtId(c.url) && !c.url.trim()).length;

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle
        title="Résumé"
        description="Vérifie tes données avant de lancer le rendu."
        action={
          missingVideo > 0 ? (
            <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              {missingVideo} extrait{missingVideo > 1 ? "s" : ""} sans vidéo
            </span>
          ) : undefined
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-4">
          {showGlobalTitle && (
            <Card title="Titre global">
              <GlobalTitleBlock g={globalTitle} />
            </Card>
          )}

          <Card
            title="Extraits"
            badge={
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium tabular-nums">
                {clips.length}
              </span>
            }
          >
            {clips.map((clip, i) => <ClipRow key={i} clip={clip} index={i} />)}
          </Card>
        </div>

        <Card title="Rendu">
          <ParamRow label="Fond" value={bgLabel} dot={background !== "video" ? background : undefined} />
          {videoMargin !== 0 && <ParamRow label="Marge vidéo" value={`${videoMargin}px`} />}
          <ParamRow label="Espacement" value={`${spacing}px`} />
          <ParamRow label="Transition" value={smoothTransition.active ? `${smoothTransition.duration}s` : "Désactivée"} />
          {watermark.active && watermark.text && (
            <ParamRow
              label="Filigrane"
              value={watermark.text}
              dot={watermark.color}
              tags={[watermark.font, `${watermark.size}px`, `${Math.round(watermark.opacity * 100)}%`]}
            />
          )}
          {highlightActive.active && <ParamRow label="Mise en avant" value="Active" dot={highlightActive.inactiveColor} />}
        </Card>
      </div>
    </section>
  );
}
