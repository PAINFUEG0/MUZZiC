/** @format */

import { useRef } from "react";
import Slider from "../../utils/Slider";
import { themeStore } from "../../../utils/themes";
import { formatDuration, hexToRgba } from "../../../../shared/helpers";
import { playerState, playerMethods, playerProgress, playerQueue, playerIndex } from "../../../utils/stores";
import { LuExpand, LuFastForward, LuList, LuPause, LuPlay, LuShuffle, LuSkipBack, LuSkipForward } from "react-icons/lu";

export function Playbar() {
  const [theme] = themeStore.use();
  const [state] = playerState.use();
  const [index] = playerIndex.use();
  const [methods] = playerMethods.use();
  const [, setQueue] = playerQueue.use();
  const [progress] = playerProgress.use();

  const ref = useRef<HTMLImageElement>(null);

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
        <div className="flex h-20 w-full min-w-0 flex-row gap-3 p-2">
          <button className="relative flex aspect-square h-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md transition-all duration-100 active:scale-95">
            <div
              children={<LuExpand />}
              className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/70 text-2xl text-white/70 opacity-0 transition-opacity duration-300 hover:opacity-100"
            />
            <img
              ref={ref}
              src={state.current?.thumb || "./logo.png"}
              className="-z-1 h-full w-full object-contain"
              style={{ filter: theme.type === "dark" ? "invert(100%)" : "" }}
            />
          </button>

          {state.current ? (
            <div className="flex h-full w-full min-w-0 flex-col items-start justify-center">
              <div className="h-fit w-full min-w-0 flex-1 truncate text-[10px] font-medium opacity-60">Album - {state.current?.album}</div>

              <div className="-mt-1 mb-px h-fit w-full min-w-0 flex-1 truncate text-sm font-bold opacity-80">{state.current?.title}</div>

              <div className="h-fit w-full min-w-0 flex-1 truncate text-[10px] font-medium opacity-60">
                Artist/s - {state.current?.artists.join(", ")}
              </div>

              <div className="h-fit w-full min-w-0 flex-1 truncate text-[9px] font-medium">
                <span className="opacity-80"> {state.current.resolution.bitrate ? "Bitrate is " : "Resolution is "}</span>
                <span className="opacity-60">
                  {state.current.resolution.bitrate
                    ? `${state.current.resolution.bitrate / 1000} kbps`
                    : `${state.current.resolution.bitDepth} bit - ${state.current.resolution.sampleRate / 1000} kHz`}
                </span>
                <span className="px-1">(</span>
                <span className="text-(--accent-color)">
                  {`${
                    state.current.resolution.name === "DD"
                      ? "Dolby Atmos"
                      : state.current.resolution.name === "HR"
                        ? "Hi-Res Lossless"
                        : state.current.resolution.name === "CD"
                          ? "CD Lossless"
                          : "Lossy"
                  }`}
                </span>
                <span className="px-1">)</span>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-start justify-center">
              <div className="text-sm font-bold">Nothing is being played right now</div>
              <div className="text-[9px] font-medium text-(--accent-color)">Please enqueue some song/s to get started</div>
            </div>
          )}
        </div>

        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <div className="mt-2 flex w-full flex-row items-center justify-center gap-5">
            <LuList className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={() => {}} />
            <LuFastForward
              className="rotate-180 cursor-pointer p-px hover:text-(--accent-color) active:scale-85"
              onClick={methods.seekBackward}
            />
            <LuSkipBack className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.prev} />
            {state.current && state.isPlaying ? (
              <LuPause className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.pause} />
            ) : (
              <LuPlay className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.resume} />
            )}
            <LuSkipForward className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.skip} />
            <LuFastForward className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.seekForward} />
            <LuShuffle
              className="cursor-pointer p-px text-[15px] hover:text-(--accent-color) active:scale-85"
              onClick={() => setQueue((q) => [...q.slice(0, index + 1), ...q.slice(index + 2).sort(() => Math.random() - 0.5)])}
            />
          </div>

          <div className="mb-1 flex h-fit w-full flex-row items-center justify-between gap-2 px-1.5 text-[9px] font-bold">
            <div className="text-nowrap">{formatDuration(progress)}</div>

            <Slider
              min={0}
              step={1}
              value={progress}
              max={state.duration}
              track={{ color: "#88888855" }}
              thumb={{ height: "0.6rem", width: "0.2rem" }}
              onChange={(e) => methods.seekTo(Number(e.target.value))}
            />

            <div className="text-nowrap">{formatDuration(state.duration)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
