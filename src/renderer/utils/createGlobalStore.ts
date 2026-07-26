/** @format */

import { create } from "zustand";

export function createGlobalStore<T extends boolean | null | number | object | string | undefined>(initial: T) {
  type Store = { data: T; update: (value: T | ((prev: T) => T)) => void };

  const store = create<Store>()((set) => ({
    data: initial,
    update: (value) => set((_) => ({ data: typeof value === "function" ? value(_.data) : value })),
  }));

  return {
    use(value?: T | ((prev: T) => T)) {
      if (value) store((state) => state.update(value));
      return [store((state) => state.data), store((state) => state.update)] as const;
    },
  };
}
