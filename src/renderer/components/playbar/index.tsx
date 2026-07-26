/** @format */

import { FXControls } from "./FXcontrols";
import { NowPlaying } from "./NowPlaying";
import { Progressbar } from "./Progressbar";
import { themeStore } from "../../utils/themes";
import { hexToRgba } from "../../../shared/helpers";
import { PlaybackControls } from "./PlaybackControls";
import { playerState, playerIndex, playerQueue } from "../../player";

export function Playbar() {
  const [theme] = themeStore.use();
  const [state] = playerState.use();
  const [index] = playerIndex.use();
  const [queue, setQueue] = playerQueue.use();

  return (
    <div className="relative flex h-20 w-full shrink-0 overflow-hidden border-t-2 border-(--border-color)/10">
      <div
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          backdropFilter: `blur(${theme.playbar.blur})`,
          backgroundColor: hexToRgba(theme.playbar.tint.color, theme.playbar.tint.opacity),
        }}
      />

      <div className="grid h-full w-full grid-cols-3 gap-3">
        <NowPlaying index={index} queueLength={queue.length} track={state.current} />

        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <PlaybackControls index={index} setQueue={setQueue} isPlaying={state.isPlaying} loading={!!(state.current && !state.duration)} />
          <Progressbar />
        </div>

        <FXControls id={state.current?.id || null} />
      </div>
    </div>
  );
}
