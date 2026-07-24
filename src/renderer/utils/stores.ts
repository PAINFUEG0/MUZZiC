/** @format */

import { PlayerMethods } from "../player/player";
import { createGlobalStore } from "./createGlobalStore";
import { PopupPayload, Track, Tree } from "../../shared/types";

const _ = { volume: 100, duration: 0, loop: false, muted: false, shuffle: false, isPlaying: false, current: null as Track | null };

export const playerState = createGlobalStore(_);
export const playerIndex = createGlobalStore<number>(0);
export const playerQueue = createGlobalStore<Track[]>([]);
export const playerProgress = createGlobalStore<number>(0);
export const playerMethods = createGlobalStore<PlayerMethods>({} as PlayerMethods);

export const searchBox = createGlobalStore<string>("");
export const treeStore = createGlobalStore<Tree>({} as Tree);
export const needsRestart = createGlobalStore<boolean>(false);
export const popupStore = createGlobalStore<PopupPayload[]>([]);
export const view = createGlobalStore<{ scene: string }>({ scene: "explorer" });
export const pcmFormatStore = createGlobalStore<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">("pcm_s16le");
export const likedSongsStore = createGlobalStore<string[]>(JSON.parse(localStorage.getItem("liked") ?? "[]"));
