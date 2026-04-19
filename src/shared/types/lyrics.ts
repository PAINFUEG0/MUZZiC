export type LineSync = { start: number; end: number; text: string };
export type WordSync = { start: number; end: number; text: string }[];

export type Lyrics<T extends "NONE" | "WORD" | "LINE"> = {
  syncType: T;
  leadingSilence: number;
  lines: T extends "WORD" ? WordSync[] : T extends "LINE" ? LineSync[] : string;
};

export type LyricsPlugin = {
  init(): Promise<LyricsPlugin>;

  getLyrics(op: {
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    isrc?: string;
  }): Promise<Lyrics<"NONE"> | Lyrics<"WORD"> | Lyrics<"LINE"> | undefined>;
};
