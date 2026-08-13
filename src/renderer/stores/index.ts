/** @format */

import { createGlobalStore } from "./create";
import { Track, Tree } from "../../shared/types";

export * from "./player";
export const searchBox = createGlobalStore<string>("");
export const sleepTimer = createGlobalStore<number>(0);
export const treeStore = createGlobalStore<Tree>({} as Tree);
export const needsRestart = createGlobalStore<boolean>(false);
export const sceneStore = createGlobalStore<{ scene: string; [K: string]: string }>({ scene: "explorer" });
export const pcmFormatStore = createGlobalStore<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">("pcm_s16le");
export const likedSongsStore = createGlobalStore<string[]>(JSON.parse(localStorage.getItem("liked") ?? "[]"));
export const notificationsStore = createGlobalStore<{ id: string; title: string; seen?: boolean; body?: React.ReactNode }[]>([]);

export const selected = createGlobalStore<string[]>([]);
export const selectMode = createGlobalStore<boolean>(false);

const playlists = JSON.parse(localStorage.getItem("playlists") ?? "[]") as { name: string; K: string }[];
const data = Object.fromEntries(playlists.map((_) => [_.K, JSON.parse(localStorage.getItem(_.K) ?? "[]") as string[]]));

export const playlistDataStore = createGlobalStore(data);
export const playlistIndexStore = createGlobalStore(playlists);

export const artistsStore = createGlobalStore<Record<string, Track[]>>({});
export const albumsStore = createGlobalStore<Partial<Record<string, Track[]>>>({});
export const flattenedTreeStore = createGlobalStore<Track[]>([]);
