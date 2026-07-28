/** @format */

import { PlayerMethods } from "./types";
import { frequencies } from "./equalizer";
import { Track } from "../../shared/types";
import { createGlobalStore } from "../utils/createGlobalStore";

const __ = {
  mute: false,
  CF: Number(localStorage.getItem("CF")),
  IG: Number(localStorage.getItem("IG") || "1"),
  PG: Number(localStorage.getItem("PG") || "100"),
  EQenabled: localStorage.getItem("EQenabled") === "true",
  EQ: JSON.parse(localStorage.getItem("EQ") || (localStorage.setItem("EQ", JSON.stringify(frequencies.map(() => 0))), localStorage.getItem("EQ"))!),
};

const _ = { duration: 0, loop: false, shuffle: false, isPlaying: false, current: null as Track | null };

export const playerState = createGlobalStore(_);
export const playerEffects = createGlobalStore(__);
export const playerIndex = createGlobalStore<number>(0);
export const playerQueue = createGlobalStore<Track[]>([]);
export const playerProgress = createGlobalStore<number>(0);
export const playerMethods = createGlobalStore({} as PlayerMethods);
export const analyzersNodes = createGlobalStore({} as { [K in "left" | "right" | "overall"]: AnalyserNode });
