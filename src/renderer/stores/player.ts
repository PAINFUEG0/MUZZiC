/** @format */

import { Track } from "../../shared/types";
import { createGlobalStore } from "./create";
import { PlayerMethods } from "../player/types";

const T = <X>(K: string, V: X) => JSON.parse(localStorage.getItem(K) || JSON.stringify(V)) as X;
const _ = { duration: 0, loop: false, shuffle: false, isPlaying: false, current: null as Track | null };

export const playerState = createGlobalStore(_);
export const playerIndex = createGlobalStore<number>(0);
export const playerQueue = createGlobalStore<Track[]>([]);
export const playerProgress = createGlobalStore<number>(0);
export const playerMethods = createGlobalStore({} as PlayerMethods);
export const volumeSettings = createGlobalStore(T("volume", { volume: 85, muted: false }));
export const analyzersNodes = createGlobalStore({} as { [K in "left" | "right" | "overall"]: AnalyserNode });
export const crossfeedSettings = createGlobalStore(T("crossfeed", { amount: 0.3, frequency: 650, enabled: false }));
export const equalizerSettings = createGlobalStore(T("equalizer", { enabled: false, gains: new Array(15).fill(0), multiplier: 1 }));
export const surroundSettings = createGlobalStore(T("surround", { widen: 0.6, height: 0.4, reverb: 0.6, virtualSpeakers: 0.5, earlyReflections: 0.5, intensity: 0.5, enabled: false }));
