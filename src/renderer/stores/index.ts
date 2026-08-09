/** @format */

import { Tree } from "../../shared/types";
import { createGlobalStore } from "./create";

export * from "./player";
export const searchBox = createGlobalStore<string>("");
export const sleepTimer = createGlobalStore<number>(0);
export const treeStore = createGlobalStore<Tree>({} as Tree);
export const needsRestart = createGlobalStore<boolean>(false);
export const sceneStore = createGlobalStore<{ scene: string }>({ scene: "explorer" });
export const pcmFormatStore = createGlobalStore<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">("pcm_s16le");
export const likedSongsStore = createGlobalStore<string[]>(JSON.parse(localStorage.getItem("liked") ?? "[]"));
export const notificationsStore = createGlobalStore<{ id: string; title: string; seen?: boolean; body?: React.ReactNode }[]>([]);

export const selected = createGlobalStore<string[]>([]);
export const selectMode = createGlobalStore<boolean>(false);
