/** @format */

import { memo } from "react";
import { playerState, playerProgress } from "../stores";

export const Fullscreen = memo(({ setShow }: { setShow: (arg: boolean) => void }) => {
  const [state] = playerState.use();
  const [progress] = playerProgress.use();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden border-5">
      <img src={state.current?.thumb.replace("thumbnail", "artwork")} alt="" onError={(e) => (e.currentTarget.src = "./logo.png")} className="absolute inset-0 z-500 h-full w-full object-cover" />
    </div>
  );
});
