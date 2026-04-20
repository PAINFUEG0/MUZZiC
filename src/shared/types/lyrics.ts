export type LyricsPlugin = {
  init(): Promise<LyricsPlugin>;

  getLyrics(op: {
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    isrc?: string;
  }): Promise<Lyrics<"None"> | Lyrics<"Word"> | Lyrics<"Line"> | undefined>;
};

export type Unsynced = Readonly<{ start: 0; end: 10e10; text: string }>;
export type LineSync = Readonly<{ start: number; end: number; text: string }>;
export type WordSync = Readonly<{ start: number; end: number; text: string }[]>;

export type Lyrics<T extends "None" | "Word" | "Line"> = {
  syncType: T;
  leadingSilence: number;
  lines: T extends "Word" ? WordSync[] : T extends "Line" ? LineSync[] : Unsynced[];
};
