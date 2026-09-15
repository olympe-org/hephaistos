import { useAppDispatch, useAppSelector } from "@/store";
import { addClip, removeClip } from "@/store/createVideoSlice";
import TextStyleFields from "./TextStyleFields";
import VideoFields from "./VideoFields";
import GlobalTitleFields from "./GlobalTitleFields";
import CheckboxSaveData from "./CheckboxSaveData";
import RenderSettings from "./RenderSettings";
import ClipsSummary from "./ClipsSummary";
import SectionTitle from "./SectionTitle";
import IconAction from "./IconAction";
import { PANEL } from "@/lib/tokens";
import { PlusIcon, Trash2Icon } from "lucide-react";

export default function CreateVideoSelectDatas() {
  const dispatch = useAppDispatch();
  const clips = useAppSelector((s) => s.createVideo.clips);
  const features = useAppSelector((s) => s.createVideo.templateFeatures);

  return (
    <div className="flex flex-col gap-10">
      {/* Titre global */}
      {features.includes("globalTitle") && (
        <section className="flex flex-col gap-4">
          <SectionTitle
            title="Titre global"
            description="Affiché en haut de la vidéo pendant toute sa durée."
          />
          <div className={PANEL}>
            <GlobalTitleFields />
          </div>
        </section>
      )}

      {/* Extraits */}
      <section className="flex flex-col gap-4">
        <SectionTitle
          title="Extraits"
          description="Un extrait, c'est un clip vidéo et son texte."
          action={
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium tabular-nums">
              {clips.length} extrait{clips.length > 1 ? "s" : ""}
            </span>
          }
        />
        <div className="flex flex-col gap-4">
          {clips.map((_, index) => (
            <div
              key={index}
              className={`flex flex-col gap-5 ${PANEL}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold">
                  Extrait {index + 1}
                </span>
                {clips.length > 1 && (
                  <IconAction
                    danger
                    aria-label="Supprimer l'extrait"
                    title="Supprimer l'extrait"
                    onClick={() => dispatch(removeClip(index))}
                  >
                    <Trash2Icon />
                  </IconAction>
                )}
              </div>
              <TextStyleFields clipIndex={index} />
              <div className="h-px bg-border" />
              <VideoFields clipIndex={index} />
            </div>
          ))}

          <button
            type="button"
            onClick={() => dispatch(addClip())}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground"
          >
            <PlusIcon className="size-4" />
            Ajouter un extrait
          </button>
        </div>
      </section>

      {/* Render settings */}
      <section className="flex flex-col gap-4">
        <SectionTitle
          title="Paramètres de rendu"
          description="Fond, marges, transitions et filigrane du montage final."
        />
        <RenderSettings />
      </section>

      <ClipsSummary />

      <CheckboxSaveData target="step2" />
    </div>
  );
}
