/** @format */

import { PlayerMethods } from "./types";
import { frequencies } from "./equalizer";
import { Track } from "../../shared/types";
import { createGlobalStore } from "../utils/createGlobalStore";

const __ = {
  muted: false,
  volume: Number(localStorage.getItem("volume") || "100"),
  crossfeed: localStorage.getItem("crossfeed") === "true",
  equalizer: localStorage.getItem("equalizer") === "true",
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
