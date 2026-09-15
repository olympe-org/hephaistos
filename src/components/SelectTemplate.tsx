import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { capitalize, templates } from "@/utils";
import { FAKE_PREVIEW } from "@/utils/constants/fakePreview.constants";
import { setTemplate } from "@/store/createVideoSlice";
import type { RootState } from "@/store";
import { cn } from "@/lib/utils";
import TemplatePreview from "./TemplatePreview";

function FrozenThumbnail({
  templateLabel,
}: {
  templateLabel: string;
  width: number;
  height: number;
}) {
  const bgSrc = FAKE_PREVIEW[templateLabel]?.bgSrc;
  const [frozenSrc, setFrozenSrc] = useState<string>();

  useEffect(() => {
    if (!bgSrc) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")?.drawImage(img, 0, 0);
      setFrozenSrc(c.toDataURL("image/jpeg", 0.85));
    };
    img.src = bgSrc;
  }, [bgSrc]);

  if (!frozenSrc) return <div className="w-full h-full bg-muted/60" />;

  return (
    <TemplatePreview
      mode="fake"
      templateOverride={templateLabel}
      fakeOverride={{ bgSrc: frozenSrc }}
    />
  );
}

const THUMB_H = 104;
const THUMB_W = Math.round((THUMB_H * 9) / 16);

export default function SelectTemplate() {
  const dispatch = useDispatch();
  const templateValue = useSelector(
    (state: RootState) => state.createVideo.templateValue,
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Template</h2>
        <p className="text-sm text-muted-foreground">
          Quatre mises en page, chacune pensée pour un style de contenu.
          L'aperçu à droite suit ton choix.
        </p>
      </div>

      <RadioGroup
        value={templateValue}
        className="gap-0 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
        onValueChange={(value) => dispatch(setTemplate(value))}
      >
        {templates.map((template) => {
          const selected = template.label === templateValue;
          return (
            <label
              key={template.label}
              htmlFor={`${template.label}-plan`}
              className={cn(
                "flex cursor-pointer items-center gap-5 p-4 transition-colors",
                selected ? "bg-muted/60" : "hover:bg-muted/40",
              )}
            >
              {/* Thumbnail — animated if selected, frozen on the first frame otherwise */}
              <div
                className="shrink-0 overflow-hidden rounded-lg bg-black ring-1 ring-black/10 dark:ring-white/10"
                style={{ width: THUMB_W, height: THUMB_H }}
              >
                {selected ? (
                  <TemplatePreview
                    mode="fake"
                    templateOverride={template.label}
                    fakeOverride={{
                      bgSrc: FAKE_PREVIEW[template.label]?.bgSrc,
                    }}
                  />
                ) : (
                  <FrozenThumbnail
                    templateLabel={template.label}
                    width={THUMB_W}
                    height={THUMB_H}
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">
                    {capitalize(template.label)}
                  </span>
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {template.description}
                </p>
              </div>

              <RadioGroupItem
                value={template.label}
                id={`${template.label}-plan`}
                className="size-5 shrink-0"
              />
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
