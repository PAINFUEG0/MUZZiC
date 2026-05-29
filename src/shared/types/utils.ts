export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type File<T extends boolean = false> = { path: string; name: string } & (T extends true ? { id: string } : {});

export type DirNode<T extends boolean = false> = { name: string; path: string; files: File<T>[]; dirs: DirNode<T>[] };

export type PopupPayload =
  | { type: "INFO_POPUP"; data: string }
  | { type: "ERROR_POPUP"; data: string }
  | { type: "SUCCESS_POPUP"; data: string }
  | { type: "WARNING_POPUP"; data: string };

export type MessagePayload =
  | PopupPayload
  | { type: "MODAL"; data: string }
  | { type: "FULLSCREEN"; data: string }
  | { type: "PROGRESS"; current: number; total: number; data: string };

// utils/semaphore.ts

// Tune this — ffprobe is I/O bound, not CPU, so you can go higher than cores
