export type Lyrics<T extends boolean = false> = {
  wordSynced: T;
  lines: Line<T>[];
  leadingSilence: number;
  transliterationAvailable: boolean;
};

export type LineSync = { start: number; end: number; text: string };
export type WordSync = { start: number; end: number; text: string }[];
export type Line<T extends boolean = false> = T extends true ? WordSync : LineSync;
