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
