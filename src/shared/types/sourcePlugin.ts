/** @format */

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
  resolution: "SR" | "CD" | "HR" | "DD";
};
