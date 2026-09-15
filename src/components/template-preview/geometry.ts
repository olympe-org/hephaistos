import type { GlobalTitleData } from "@/store/createVideoSlice";

// Dimensions of the video rendered by the server (1080×1920): the whole text
// layer is positioned in this frame, then scaled down for the preview.
export const VIDEO_W = 1080;
export const VIDEO_H = 1920;

export const RANK_X = 60;
export const CLIP_TITLE_X = 180;

// Settings that change per template (video position/height, default spacing)
export interface TemplateLayout {
  videoY: number;
  videoH: number;
  defaultSpacing: number;
}

export function getTemplateLayout(templateValue: string): TemplateLayout {
  switch (templateValue) {
    case "classic":
      return { videoY: 780, videoH: 700, defaultSpacing: 60 };
    case "minimal":
      return { videoY: 610, videoH: 700, defaultSpacing: 60 };
    case "expanded":
      return { videoY: 250, videoH: 1420, defaultSpacing: 20 };
    default: // "top"
      return { videoY: 960, videoH: 700, defaultSpacing: 60 };
  }
}

// Y position below which the next content (the "top" template's clip list)
// can start, once the global title has been placed.
export function headerBottom(g: GlobalTitleData): number {
  if (g.subtitle) return 290 + g.subtitleStyle.size + 30;
  if (g.second) return 210 + g.titleStyle.size + 30;
  if (g.first) return 120 + g.titleStyle.size + 30;
  return 60;
}
