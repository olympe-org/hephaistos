import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/store";
import type { CreateVideoState } from "@/store/createVideoSlice";
import { setJob, updateJob, type RenderJob } from "@/store/renderSlice";
import {
  buildRenderBody,
  cancelRender,
  getShareLink,
  startRender,
  subscribeToJob,
} from "@/utils/api/render";
import { buildTemplateData, saveStep1, saveTemplateConfig } from "@/utils/saveDefaults";

// Starts the render (saving defaults, API call, SSE subscription) and handles
// its cancellation as well as loading the video once it's done.
export function useRenderLaunch(createVideoState: CreateVideoState, job: RenderJob | null) {
  const dispatch = useAppDispatch();
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Close the SSE stream if we leave the page
  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  // Once the render is done, load a streamable share link into the preview
  // (a direct <video src>, not a Blob — the browser streams it progressively)
  useEffect(() => {
    if (job?.status === "done" && job.job_id) {
      getShareLink(job.job_id)
        .then(({ url }) => setVideoUrl(url))
        .catch((err) => console.error("Failed to load video preview:", err));
    }
  }, [job?.status, job?.job_id]);

  const launch = async () => {
    setLaunchError(null);
    setIsLaunching(true);
    setVideoUrl(null);

    if (createVideoState.saveStep1Checked) {
      saveStep1({
        templateValue: createVideoState.templateValue,
        modeValue: createVideoState.modeValue,
      });
    }
    if (createVideoState.saveStep2Checked) {
      saveTemplateConfig(
        createVideoState.templateValue,
        buildTemplateData(createVideoState),
      );
    }

    try {
      const body = buildRenderBody(createVideoState);
      const newJob = await startRender(body);
      dispatch(setJob(newJob));
      cleanupRef.current = subscribeToJob(newJob.job_id, dispatch);
      return true;
    } catch (err: unknown) {
      const detail =
        err instanceof Error
          ? err.message
          : (err as { detail?: { message?: string } })?.detail?.message;
      setLaunchError(detail ?? "Impossible de lancer le rendu.");
      return false;
    } finally {
      setIsLaunching(false);
    }
  };

  const cancel = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    const jobId = job?.job_id;
    dispatch(updateJob({ status: "cancelled" }));
    setVideoUrl(null);
    if (jobId) cancelRender(jobId).catch(() => null);
  };

  return { isLaunching, launchError, videoUrl, launch, cancel };
}
