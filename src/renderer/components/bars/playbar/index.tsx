/** @format */

import Volume from "./Volume";
import { useRef } from "react";
import * as LU from "react-icons/lu";
import Slider from "../../utils/Slider";
import { SiDolby } from "react-icons/si";
import { themeStore } from "../../../utils/themes";
import { TbBrandDolbyDigital } from "react-icons/tb";
import { likedSongsStore } from "../../../utils/stores";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";
import { formatDuration, hexToRgba } from "../../../../shared/helpers";
import { playerState, playerIndex, playerMethods, playerQueue, playerProgress, playerEffects } from "../../../player";

export function Playbar() {
  const [theme] = themeStore.use();
  const [state] = playerState.use();
  const [index] = playerIndex.use();
  const [methods] = playerMethods.use();
  const [, setQueue] = playerQueue.use();
  const [progress] = playerProgress.use();
  const [fx, setFx] = playerEffects.use();
  const [liked, setLiked] = likedSongsStore.use();

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
              children={<LU.LuExpand />}
              className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/70 text-2xl text-white/70 opacity-0 transition-opacity duration-300 hover:opacity-100"
            />
            <img ref={ref} src={state.current?.thumb || "./logo.png"} className="-z-1 h-full w-full object-contain" />
          </button>

          {state.current ? (
            <div className="flex h-full w-full min-w-0 flex-col items-start justify-center">
              <div className="h-fit w-full min-w-0 flex-1 truncate text-[10px] font-medium opacity-60">Album - {state.current?.album}</div>

              <div className="-mt-1 mb-px h-fit w-full min-w-0 flex-1 truncate text-sm font-bold opacity-80">{state.current?.title}</div>

              <div className="h-fit w-full min-w-0 flex-1 truncate text-[10px] font-medium opacity-60">
                Artist/s - {state.current?.artists.join(", ")}
              </div>

              <div className="h-fit w-full min-w-0 flex-1 truncate text-[9px] font-light opacity-70">
                <span className="">{state.current.path.split(".").at(-1)?.toUpperCase()}</span>
                <span className="px-1">|</span>
                <span className="">{state.current.resolution.bitDepth ? state.current.resolution.bitDepth + " bit" : "Bit depth N/A"}</span>
                <span className="px-1">|</span>
                <span className="">{state.current.resolution.sampleRate / 1000} kHz</span>
                <span className="px-1">|</span>
                <span className="">{Math.round(state.current.resolution.bitrate / 1000)} kbps</span>
                <span className="px-1">|</span>
                {state.current.resolution.name === "DD"
                  ? "Dolby Atmos"
                  : state.current.resolution.name === "HR"
                    ? "Hi-Res Lossless"
                    : state.current.resolution.name === "CD"
                      ? "CD Lossless"
                      : "Lossy"}
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
            <LU.LuList className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={() => {}} />
            <LU.LuFastForward
              className="rotate-180 cursor-pointer p-px hover:text-(--accent-color) active:scale-85"
              onClick={methods.seekBackward}
            />
            <LU.LuSkipBack className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.prev} />
            {state.current && !state.duration ? (
              <LU.LuLoaderCircle className="animate-spin" />
            ) : state.current && state.isPlaying ? (
              <LU.LuPause className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.pause} />
            ) : (
              <LU.LuPlay className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.resume} />
            )}
            <LU.LuSkipForward className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.skip} />
            <LU.LuFastForward className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" onClick={methods.seekForward} />
            <LU.LuShuffle
              className="cursor-pointer p-px text-[15px] hover:text-(--accent-color) active:scale-85"
              onClick={() => setQueue((q) => [...q.slice(0, index + 1), ...q.slice(index + 2).sort(() => Math.random() - 0.5)])}
            />
          </div>

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
        </div>

        <div className="flex h-full w-full flex-row items-center justify-between gap-2">
          <div className="flex w-full flex-row items-center justify-between px-10">
            <div className="flex w-full flex-row items-center justify-center gap-5">
              {fx.crossfeed ? (
                <SiDolby
                  className="m-0.5 cursor-pointer text-(--accent-color) active:scale-85"
                  onClick={() => setFx((s) => ({ ...s, crossfeed: false }))}
                />
              ) : (
                <TbBrandDolbyDigital
                  className="cursor-pointer text-xl hover:text-(--accent-color) active:scale-85"
                  onClick={() => setFx((s) => ({ ...s, crossfeed: true }))}
                />
              )}
              {state.current && liked.includes(state.current.id) ? (
                <RiHeartFill
                  className="cursor-pointer text-lg text-(--accent-color) active:scale-85"
                  onClick={() => setLiked((liked) => liked.filter((e) => e !== state.current!.id))}
                />
              ) : (
                <RiHeartLine
                  className="cursor-pointer text-lg hover:text-(--accent-color) active:scale-85"
                  onClick={() => setLiked((liked) => [...liked, state.current!.id])}
                />
              )}

              <LU.LuCircleGauge className="cursor-pointer hover:text-(--accent-color) active:scale-85" onClick={() => {}} />
              <LU.LuSlidersVertical className="cursor-pointer hover:text-(--accent-color) active:scale-85" onClick={() => {}} />
            </div>

            <Volume />
          </div>
        </div>
      </div>
    </div>
  );
}
