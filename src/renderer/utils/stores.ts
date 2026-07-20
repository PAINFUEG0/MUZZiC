/** @format */

import { createGlobalStore } from "./createGlobalStore";
import { PopupPayload, Tree } from "../../shared/types";

export const searchBox = createGlobalStore<string>("");
export const treeStore = createGlobalStore<Tree>({} as Tree);
export const needsRestart = createGlobalStore<boolean>(false);
export const popupStore = createGlobalStore<PopupPayload[]>([]);
export const view = createGlobalStore<{ scene: string }>({ scene: "explorer" });
export const pcmFormatStore = createGlobalStore<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">("pcm_s16le");
export const likedSongsStore = createGlobalStore<string[]>(JSON.parse(localStorage.getItem("liked") ?? "[]"));
