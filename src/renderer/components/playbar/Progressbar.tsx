/** @format */

import { memo } from "react";
import Slider from "../utils/Slider";
import { formatDuration } from "../../../shared/helpers";
import { playerState, playerProgress, playerMethods } from "../../player";

export const Progressbar = memo(() => {
  const [state] = playerState.use();
  const [methods] = playerMethods.use();
  const [progress] = playerProgress.use();

  return (
    <div className="mb-1 flex h-fit w-full flex-row items-center justify-between gap-2 px-1.5 text-[9px] font-bold">
      <div className="text-nowrap">{formatDuration(progress)}</div>

      <Slider
        min={0}
        step={1}
        max={state.duration || 1}
        value={state.duration ? progress : 0}
        thumb={{ height: "0.6rem", width: "0.2rem" }}
        onChange={(e) => methods.seekTo(Number(e.target.value))}
      />

      <div className="text-nowrap">{formatDuration(state.duration)}</div>
    </div>
  );
});
