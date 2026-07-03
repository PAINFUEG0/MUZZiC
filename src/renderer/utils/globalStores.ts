/** @format */

import { create } from "zustand";
import { themes } from "./themes";
import { Tree } from "../../shared/types";

export function createGlobalStore<T extends boolean | null | number | object | string | undefined>(initial: T) {
  type Store = { data: T; update: (newValue: T) => void };

  const store = create<Store>()((updateState) => ({ data: initial, update: (updatedValue) => updateState({ data: updatedValue }) }));

  return {
    use() {
      const data = store((s) => s.data);
      const update = store((s) => s.update);
      const setData = (arg: T | ((prev: T) => T)) => (typeof arg === "function" ? update(arg(store.getState().data)) : update(arg));
      return [data, setData] as const;
    },
  };
}

export const searchBox = createGlobalStore<string>("");
export const treeStore = createGlobalStore<Tree>({} as Tree);
export const view = createGlobalStore<{ scene: string }>({ scene: "explorer" });
export const themeStore = createGlobalStore<(typeof themes)[number]>(themes[Number(localStorage.getItem("theme")) || 0]!);
