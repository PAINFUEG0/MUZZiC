/** @format */

import { LuExpand } from "react-icons/lu";
import { themeStore } from "../../../utils/globalStores";

export function Playbar() {
  const [theme] = themeStore.use();

  return (
    <div className="relative flex h-20 w-full shrink-0 overflow-hidden border-t-2 border-(--border-color)/10 backdrop-blur-md">
      <div className="absolute inset-0 -z-9 h-full w-full bg-white" style={{ opacity: theme.tint.white.bars }} />
      <div className="absolute inset-0 -z-10 h-full w-full bg-black" style={{ opacity: theme.tint.black.bars }} />

      <div className="grid h-full w-full grid-cols-3">
        <div className="flex h-20 w-full flex-row gap-3 p-2">
          <button className="relative flex aspect-square h-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md transition-all duration-100 active:scale-95">
            <div
              className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/70 text-2xl text-white/70 opacity-0 hover:opacity-100"
              children={<LuExpand />}
            />
            <img src="./logo.png" className="h-full w-full object-contain" />
          </button>

          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="flex h-fit w-full min-w-0 truncate text-sm font-bold opacity-80">Nothing is being played right now</div>
            <div className="flex h-fit w-full min-w-0 truncate text-[10px] font-medium opacity-60">
              Please enqueue some song/s to get started
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
