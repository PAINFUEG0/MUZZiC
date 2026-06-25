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

export type File = { path: string; name: string; id: string };
export type DirNode = { name: string; path: string; files: File[]; dirs: DirNode[] };

export type Track = {
  id: string;
  title: string;
  thumb: string;
  album: string;
  lyrics: string;
  duration: number;
  artists: string[];
  explicit: boolean;
  streamURI: string;
  needsTranscoding: boolean;
  resolution: { name: "SR" | "CD" | "HR" | "DD"; bitDepth: number; sampleRate: number; bitrate: number };
};

export type API = {
  close: () => Promise<void>;
  minimize: () => Promise<void>;
  fullscreen: () => Promise<void>;

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

  getTree: (K: string) => Promise<DirNode | null>;
  setTree: (K: string, V: DirNode) => Promise<DirNode>;

  extractMetadata: (flat: File[]) => Promise<{ key: string; value: Track }[]>;

  deleteMeta: <T extends string | string[], R extends boolean>(K: T) => Promise<T extends string ? R : R[]>;
  getMeta: <T extends string | string[], R extends Track | null>(K: T) => Promise<T extends string ? R : R[]>;
  setMeta: <T extends [string, Track] | [{ key: string; value: Track }[]], R extends Track>(
    ...args: T
  ) => Promise<T extends [string, Track] ? R : R[]>;

  transcode: (input: string) => Promise<string>;
};
