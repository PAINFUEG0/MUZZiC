/** @format */

import { create } from "zustand";
import { Track } from "../../shared/types/sourcePlugin";

type T = { name: string; path: string; files: Track<true>[]; dirs: T[] };

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

export const treeStore = createGlobalStore<T>({} as T);
