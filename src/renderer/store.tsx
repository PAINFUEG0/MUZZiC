import { create } from "zustand";

export function createGlobalStore<T extends boolean | null | number | object | string | undefined>(initial: T) {
  type Store = { data: T; update: (newValue: T) => void };

  const store = create<Store>()((updateState) => ({
    data: initial,
    update: (updatedValue) => updateState({ data: updatedValue }),
  }));

  return {
    use() {
      const data = store((s) => s.data);
      const update = store((s) => s.update);

      function setData(arg: T | ((prev: T) => T)) {
        if (typeof arg === "function") update(arg(store.getState().data));
        else update(arg);
      }

      return [data, setData] as const;
    },
  };
}
