import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DownloadIcon } from "lucide-react";
import BillionsClubDialog from "@/components/BillionsClubDialog";
import CardFooterCustom from "@/components/CardFooterCustom";
import CreateVideoSelectDatas from "@/components/CreateVideoSelectDatas";
import CreateVideoSelects from "@/components/CreateVideoSelects";
import ImportJsonDialog from "@/components/ImportJsonDialog";
import RenderJobContent from "@/components/RenderJobContent";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  applyTemplateDefaults,
  resetStep2,
  setModeValue,
  setTemplate,
} from "@/store/createVideoSlice";
import { downloadVideo } from "@/utils/api/render";
import { loadStep1, loadTemplateConfig } from "@/utils/saveDefaults";
import PreviewPanel from "./create-video/PreviewPanel";
import StepHeader from "./create-video/StepHeader";
import { usePausablePreview } from "./create-video/usePausablePreview";
import { useRenderLaunch } from "./create-video/useRenderLaunch";

const RUNNING_STATUSES = ["pending", "downloading", "processing"];

// 3-step creation flow: template & mode → data & settings → render
export default function CreateVideo() {
  usePageMeta({ title: "Créer une vidéo · Vexia", path: "/create-video", indexable: false });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const createVideoState = useAppSelector((s) => s.createVideo);
  const userFeatures = useAppSelector((s) => s.auth.features);
  const job = useAppSelector((s) => s.render.job);
  const token = useAppSelector((s) => s.auth.token);

  const [currentStep, setCurrentStep] = useState(1);
  const [billionsOpen, setBillionsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const preview = usePausablePreview();
  const { isLaunching, launchError, videoUrl, launch, cancel } =
    useRenderLaunch(createVideoState, job);

  const isRunning = job !== null && RUNNING_STATUSES.includes(job.status);
  const isDone = job?.status === "done";
  const step2Valid = createVideoState.clips.every((clip, i) => {
    const isTeaser = i === 0 && createVideoState.teaserTop;
    return clip.title.trim() !== "" && (isTeaser || clip.url.trim() !== "");
  });

  // Load the saved defaults (template + mode) on mount
  useEffect(() => {
    const saved = loadStep1();
    if (saved) {
      dispatch(setTemplate(saved.templateValue));
      dispatch(setModeValue(saved.modeValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- must only run on mount
  }, []);

  // Every step starts back at the top of the content area
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [currentStep]);

  const handlePrev = () => {
    if (currentStep === 2) dispatch(resetStep2());
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      if (await launch()) setCurrentStep(3);
      return;
    }
    if (currentStep === 1) {
      const saved = loadTemplateConfig(createVideoState.templateValue);
      if (saved) dispatch(applyTemplateDefaults(saved));
    }
    setCurrentStep((s) => Math.min(3, s + 1));
  };

  // Columns a bit shorter when the guest banner is shown above the nav
  const hasGuestBanner = !token;
  const colHeight = hasGuestBanner
    ? "h-[calc(100vh-var(--nav-h)-2.5rem)]"
    : "h-[calc(100vh-var(--nav-h))]";

  const footerLeft =
    currentStep !== 3 ? undefined : isRunning ? (
      <Button
        variant="destructive"
        className="h-10 rounded-full px-5"
        onClick={cancel}
      >
        Annuler
      </Button>
    ) : (
      <Button
        variant="ghost"
        className="h-10 rounded-full px-4"
        onClick={handlePrev}
      >
        Retour
      </Button>
    );

  const footerRight =
    !token && currentStep === 2 ? (
      <Button
        className="h-10 rounded-full px-5"
        onClick={() => navigate("/login")}
      >
        Se connecter
      </Button>
    ) : currentStep === 3 && isDone && job?.job_id ? (
      <Button
        className="h-10 rounded-full px-5"
        onClick={() =>
          downloadVideo(job.job_id).catch((err) =>
            console.error("Download failed:", err),
          )
        }
      >
        <DownloadIcon className="size-4" />
        Télécharger
      </Button>
    ) : currentStep === 3 ? (
      <div className="w-30.5" /> // keeps the "Cancel / Back" button centered
    ) : undefined;

  return (
    <section className="flex gap-10 px-6 lg:px-10">
      <div className={`w-full ${colHeight} flex flex-col`}>
        <StepHeader
          currentStep={currentStep}
          userFeatures={userFeatures}
          onOpenBillionsClub={() => setBillionsOpen(true)}
          onOpenImportJson={() => setImportOpen(true)}
        />
        <div className="h-px shrink-0 bg-border" />

        <div
          ref={contentRef}
          className="no-scrollbar flex flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto py-6"
        >
          {currentStep === 1 && <CreateVideoSelects />}
          {currentStep === 2 && (
            <>
              <CreateVideoSelectDatas />
              {launchError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {launchError}
                </div>
              )}
            </>
          )}
          {currentStep === 3 && <RenderJobContent />}
        </div>

        <div className="h-px shrink-0 bg-border" />

        <CardFooterCustom
          currentStep={currentStep}
          onPrev={handlePrev}
          onNext={handleNext}
          nextLabel={currentStep === 2 ? "Lancer le rendu" : undefined}
          nextDisabled={(currentStep === 2 && !step2Valid) || isLaunching}
          showPrev={currentStep > 1}
          leftAction={footerLeft}
          rightAction={footerRight}
        />
      </div>

      <PreviewPanel
        currentStep={currentStep}
        templateValue={createVideoState.templateValue}
        isDone={isDone}
        isRunning={isRunning}
        videoUrl={videoUrl}
        columnHeightClass={colHeight}
        hasBottomGap={!hasGuestBanner}
        previewContainerRef={preview.containerRef}
        previewPaused={preview.paused}
        previewResetKey={preview.resetKey}
        onTogglePreview={preview.toggle}
      />

      <BillionsClubDialog
        open={billionsOpen}
        onOpenChange={setBillionsOpen}
      />
      <ImportJsonDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </section>
  );
}
