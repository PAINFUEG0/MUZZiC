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
  resolution: { name: "SR" | "CD" | "HR" | "DD"; bitDepth: number; sampleRate: number; bitrate: number };
};
