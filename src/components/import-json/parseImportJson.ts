import type { ClipData, GlobalTitleData } from "@/store/createVideoSlice";

// Accepted input shapes: optional fields, filled in with default values
// before going into the store (see toClipData / toGlobalTitle)
export interface JsonClip {
  id?: string;
  idStyle?: Partial<ClipData["idStyle"]>;
  title?: string;
  titleStyle?: Partial<ClipData["titleStyle"]>;
  subtitle?: string;
  subtitleStyle?: Partial<ClipData["subtitleStyle"]>;
  url?: string;
  start_time?: string;
  duration?: number;
  claude?: boolean;
}

export interface JsonGlobalTitle {
  first?: string;
  second?: string;
  subtitle?: string;
  titleStyle?: Partial<GlobalTitleData["titleStyle"]>;
  subtitleStyle?: Partial<GlobalTitleData["subtitleStyle"]>;
}

export interface ParsedImport {
  globalTitle: JsonGlobalTitle | null;
  clips: JsonClip[];
}

const DEFAULT_ID_STYLE: ClipData["idStyle"] = {
  border: 2,
  color: "0xFFFFFF",
  font: "dejavu",
  size: 50,
};
const DEFAULT_TITLE_STYLE: ClipData["titleStyle"] = {
  animation: "none",
  border: 2,
  color: "0xFFFFFF",
  font: "inter-semibold",
  position: "left",
  size: 45,
};
const DEFAULT_GLOBAL_TITLE_STYLE: GlobalTitleData["titleStyle"] = {
  border: 2,
  color: "0xFFFFFF",
  font: "dejavu",
  size: 60,
};
const DEFAULT_GLOBAL_SUB_STYLE: GlobalTitleData["subtitleStyle"] = {
  border: 0,
  color: "0xC9C9C9",
  font: "dejavu",
  size: 36,
};

export function toClipData(raw: JsonClip, index: number): ClipData {
  return {
    id: raw.id ?? `${index + 1}.`,
    idStyle: { ...DEFAULT_ID_STYLE, ...raw.idStyle },
    claude: raw.claude ?? false,
    title: raw.title ?? "",
    url: raw.url ?? "",
    start_time: raw.start_time ?? "00:00:00",
    duration: raw.duration ?? 5,
    titleStyle: { ...DEFAULT_TITLE_STYLE, ...raw.titleStyle },
    subtitle: raw.subtitle ?? "",
    subtitleStyle: { ...DEFAULT_TITLE_STYLE, ...raw.subtitleStyle },
  };
}

export function toGlobalTitle(raw: JsonGlobalTitle): Partial<GlobalTitleData> {
  return {
    first: raw.first ?? "",
    second: raw.second ?? "",
    subtitle: raw.subtitle ?? "",
    titleStyle: { ...DEFAULT_GLOBAL_TITLE_STYLE, ...raw.titleStyle },
    subtitleStyle: { ...DEFAULT_GLOBAL_SUB_STYLE, ...raw.subtitleStyle },
  };
}

// Accepts an array of clips [ … ] or a full object { title, data }
export function parseImportJson(
  value: string,
): { result: ParsedImport; error: null } | { result: null; error: string } {
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return { result: { globalTitle: null, clips: parsed as JsonClip[] }, error: null };
    }
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) {
      return {
        result: { globalTitle: parsed.title ?? null, clips: parsed.data as JsonClip[] },
        error: null,
      };
    }
    return {
      result: null,
      error: "Format invalide. Attendu : un tableau [ … ] ou { title: {…}, data: [ … ] }",
    };
  } catch (e) {
    return { result: null, error: (e as Error).message };
  }
}

export const IMPORT_JSON_PLACEHOLDER = `[
  {
    "id": "1.",
    "title": "Blinding Lights (4.20b)",
    "subtitle": "4 223 804 521 streams",
    "url": "https://www.youtube.com/watch?v=...",
    "start_time": "00:00:45",
    "duration": 7
  }, ...
]

ou

{
  "title": {
    "first": "TOP 5 The Weeknd's",
    "second": "Most Streamed Songs",
    "subtitle": "(on Spotify)"
  },
  "data": [
    {
      "id": "1.",
      "title": "Blinding Lights (4.20b)",
      "subtitle": "4 223 804 521 streams",
      "url": "https://www.youtube.com/watch?v=...",
      "start_time": "00:00:45",
      "duration": 7
    }, ...
  ]
}
`;
