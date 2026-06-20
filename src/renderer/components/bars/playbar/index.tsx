/** @format */

import { themeStore } from "../../../utils/globalStores";

export function Playbar() {
  const [theme] = themeStore.use();

  return (
    <div className="flex h-20 w-full shrink-0 border-t-2 border-(--border-color)/10 backdrop-blur-md">
      <div className="absolute inset-0 -z-9 h-full w-full bg-white" style={{ opacity: theme.tint.white.bars }} />
      <div className="absolute inset-0 -z-10 h-full w-full bg-black" style={{ opacity: theme.tint.black.bars }} />

      <div className="flex aspect-square h-full shrink-0 p-2">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md">
          <img src="./logo.png" className="h-full w-full object-contain invert" />
        </div>
      </div>
    </div>
  );
}
