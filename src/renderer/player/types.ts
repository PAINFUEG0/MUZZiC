/** @format */

import { Track } from "../../shared/types";

export const defaultPlayerState = {
  volume: 100,
  muted: false,
  loop: false,
  shuffle: false,
  duration: 0,
  isPlaying: false,
  current: null as Track | null,
};

export type PlayerState = typeof defaultPlayerState;

export type PlayerMethods = {
  play: (src: string) => void;
  pause: () => void;
  resume: () => void;
  clearQueue: () => void;
  enqueue: (track: Track[]) => void;
  seekForward: () => void;
  seekBackward: () => void;
  seekTo: (time: number) => void;
  jumpTo: (i: number) => void;
  skip: () => void;
  prev: () => void;
  destroy: () => void;
};
