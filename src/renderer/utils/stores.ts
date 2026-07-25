/** @format */

import { frequencies } from "../player/equalizer";
import { createGlobalStore } from "./createGlobalStore";
import { PopupPayload, Track, Tree } from "../../shared/types";

const __ = {
  muted: false,
  crossfeed: localStorage.getItem("crossfeed") === "true",
  equalizer: localStorage.getItem("equalizer") === "true",
  volume: Number(localStorage.getItem("volume") || "100"),
  inputGain: Number(localStorage.getItem("inputGain") || "0"),
  gains: JSON.parse(localStorage.getItem("gains") || JSON.stringify(frequencies.map(() => 0))),
};

const _ = { duration: 0, loop: false, shuffle: false, isPlaying: false, current: null as Track | null };

export const playerState = createGlobalStore(_);
export const playerEffects = createGlobalStore(__);
export const playerIndex = createGlobalStore<number>(0);
export const playerQueue = createGlobalStore<Track[]>([]);
export const playerProgress = createGlobalStore<number>(0);
export const playerMethods = createGlobalStore({} as PlayerMethods);
export const analyzersNodes = createGlobalStore({} as { [K in "left" | "right" | "overall"]: AnalyserNode });

export const searchBox = createGlobalStore<string>("");
export const treeStore = createGlobalStore<Tree>({} as Tree);
export const needsRestart = createGlobalStore<boolean>(false);
export const popupStore = createGlobalStore<PopupPayload[]>([]);
export const view = createGlobalStore<{ scene: string }>({ scene: "explorer" });
export const pcmFormatStore = createGlobalStore<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">("pcm_s16le");
export const likedSongsStore = createGlobalStore<string[]>(JSON.parse(localStorage.getItem("liked") ?? "[]"));

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
