/** @format */

import { Track } from "../../shared/types";

export interface PlayerMethods {
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
}
