/** @format */

export type Prettify<T> = { [K in keyof T]: T[K] } & {};
type UsageComponents = { gpu: number; tab: number; browser: number; utility: number };

export type MessagePayload = Prettify<{ type: "MESSAGE"; data: string } | { type: "PROGRESS"; current: number; total: number; data: string }>;

export type Track = BaseTrack & DirNode["files"][number];
export type File = { path: string; name: string; id: string };
export type Tree = { name: string; path: string; files: Track[]; dirs: Tree[] };
export type DirNode = { name: string; path: string; files: File[]; dirs: DirNode[] };

export type BaseTrack = {
  id: string;
  thumb: string;
  title: string;

  duration: number;

  layout: string;
  channels: number;

  codec: string;

  resolution: { name: "SR" | "CD" | "HR" | "DD"; bitDepth: number; sampleRate: number; bitrate: number; sampleFormat: string };

  album: string;
  artists: string[];

  lyrics: string;
  explicit: boolean;
};

export type API = {
  getPort: () => Promise<string>;
  getThumbPath: () => Promise<string>;

  checkDLP: () => Promise<boolean>;
  checkFFMPEG: () => Promise<boolean>;
  checkFFPROBE: () => Promise<boolean>;

  downloadDLP: () => Promise<void>;
  downloadFFMPEG: () => Promise<void>;
  downloadFFPROBE: () => Promise<void>;

  getMediaFolder: () => Promise<string | null>;
  getTree: (K: string) => Promise<DirNode | null>;
  getAllMeta: () => Promise<{ [K: string]: BaseTrack }>;
  getPcmFormat: () => Promise<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">;
  getMeta: <T extends string | string[], R extends BaseTrack | null>(K: T) => Promise<T extends string ? R : R[]>;

  setMediaFolder: (dir: string) => Promise<void>;
  setTree: (K: string, V: DirNode) => Promise<DirNode>;
  setPcmFormat: (format: "pcm_s16le" | "pcm_s24le" | "pcm_s32le") => Promise<void>;
  setMeta: <T extends [string, BaseTrack] | [{ key: string; value: BaseTrack }[]], R extends BaseTrack>(...args: T) => Promise<T extends [string, BaseTrack] ? R : R[]>;

  deleteTree: (K: string) => Promise<boolean>;
  deleteMeta: <T extends string | string[], R extends boolean>(K: T) => Promise<T extends string ? R : R[]>;

  scan: (dir: string) => Promise<DirNode>;
  transcode: (input: string) => Promise<string>;
  deleteThumbnails: (ids: string[]) => Promise<void>;
  extractAndSaveMetadata: (flat: File[]) => Promise<{ key: string; value: BaseTrack }[]>;

  close: () => Promise<void>;
  minimize: () => Promise<void>;
  fullscreen: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  openFolderDialog: () => Promise<string | null>;
  usage: () => Promise<{ CPU: number; RAM: number; cpu: UsageComponents; mem: UsageComponents }>;
};
