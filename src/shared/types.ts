/** @format */

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type PopupPayload = Prettify<
  { type: "POPUP" } & (
    | { category: "INFO"; data: string; duration: number }
    | { category: "ERROR"; data: string; duration: number }
    | { category: "SUCCESS"; data: string; duration: number }
    | { category: "WARNING"; data: string; duration: number }
  )
>;

export type MessagePayload = Prettify<
  | PopupPayload
  | { type: "MODAL"; data: string }
  | { type: "FULLSCREEN"; data: string }
  | { type: "PROGRESS"; current: number; total: number; data: string }
>;

export type Track = BaseTrack & DirNode["files"][number];
export type File = { path: string; name: string; id: string };
export type Tree = { name: string; path: string; files: Track[]; dirs: Tree[] };
export type DirNode = { name: string; path: string; files: File[]; dirs: DirNode[] };

export type BaseTrack = {
  id: string;
  title: string;
  thumb: string;
  album: string;
  lyrics: string;
  duration: number;
  artists: string[];
  explicit: boolean;
  needsTranscoding: boolean;
  resolution: { name: "SR" | "CD" | "HR" | "DD"; bitDepth: number; sampleRate: number; bitrate: number };
};

export type API = {
  close: () => Promise<void>;
  minimize: () => Promise<void>;
  fullscreen: () => Promise<void>;

  usage: () => Promise<{
    CPU: number;
    RAM: number;
    cpu: { gpu: number; tab: number; browser: number; utility: number };
    mem: { gpu: number; tab: number; browser: number; utility: number };
  }>;

  getPort: () => Promise<string>;

  checkDLP: () => Promise<boolean>;
  downloadDLP: () => Promise<void>;

  checkFFMPEG: () => Promise<boolean>;
  downloadFFMPEG: () => Promise<void>;

  checkFFPROBE: () => Promise<boolean>;
  downloadFFPROBE: () => Promise<void>;

  getMediaFolder: () => Promise<string | null>;
  setMediaFolder: (dir: string) => Promise<void>;

  openFolderDialog: () => Promise<string | null>;

  scan: (dir: string) => Promise<DirNode>;

  deleteTree: (K: string) => Promise<boolean>;
  getTree: (K: string) => Promise<DirNode | null>;
  setTree: (K: string, V: DirNode) => Promise<DirNode>;

  extractAndSaveMetadata: (flat: File[]) => Promise<{ key: string; value: BaseTrack }[]>;

  getAllMeta: () => Promise<{ [K: string]: BaseTrack }>;
  deleteMeta: <T extends string | string[], R extends boolean>(K: T) => Promise<T extends string ? R : R[]>;
  getMeta: <T extends string | string[], R extends BaseTrack | null>(K: T) => Promise<T extends string ? R : R[]>;
  setMeta: <T extends [string, BaseTrack] | [{ key: string; value: BaseTrack }[]], R extends BaseTrack>(
    ...args: T
  ) => Promise<T extends [string, BaseTrack] ? R : R[]>;

  getPcmFormat: () => Promise<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">;
  setPcmFormat: (format: "pcm_s16le" | "pcm_s24le" | "pcm_s32le") => Promise<void>;

  transcode: (input: string) => Promise<string>;
};
