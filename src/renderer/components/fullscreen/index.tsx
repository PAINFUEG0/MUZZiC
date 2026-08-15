/** @format */

import { memo } from "react";
import { Lyrics } from "./Lyrics";
import { BsPerson } from "react-icons/bs";
import { FaAngleDown } from "react-icons/fa6";
import { themeStore } from "../../stores/theme";
import { DynamicBackground } from "./Background";
import { Progressbar } from "../playbar/Progressbar";
import { createGlobalStore } from "../../stores/create";
import { PlaybackControls } from "../playbar/PlaybackControls";
import { playerState, playerIndex, playerQueue } from "../../stores";

const _ = createGlobalStore<boolean>(false);

export const Fullscreen = memo(({ setShow }: { setShow: (arg: boolean) => void }) => {
  const [theme] = themeStore.use();
  const [index] = playerIndex.use();
  const [state] = playerState.use();
  const [, setQueue] = playerQueue.use();

  const [showLyrics, setShowLyrics] = _.use();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden text-white">
      <div onClick={() => setShow(false)} className="absolute top-0 right-0 z-100 shrink-0 cursor-pointer p-5 text-xl opacity-10 hover:opacity-70" children={<FaAngleDown />} />

      {showLyrics ? (
        <div className="absolute inset-0 z-20 h-full w-full object-cover">
          <DynamicBackground artworkUrl={state.current!.thumb.replace("thumbnail.", "artwork.")} alt={theme.background} />
        </div>
      ) : (
        [
          <img
            key="thumb"
            onError={(e) => (e.currentTarget.src = theme.background)}
            src={state.current?.thumb.replace("thumbnail.", "artwork.")}
            className="absolute inset-0 z-20 h-full w-full scale-115 object-cover brightness-85"
          />,
          <div
            key="gradient"
            className="absolute bottom-0 z-30 h-[90%] w-full invert-5"
            style={{ backgroundImage: "linear-gradient(to top, black 0%, black 5%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 70%, transparent 90%, transparent 100%)" }}
          />,
          <div
            key="blur"
            className="absolute bottom-0 z-50 h-[63%] w-full backdrop-blur-3xl"
            style={{
              maskImage: "linear-gradient(to top, black 0%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to top, black 0%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)",
            }}
          />,
        ]
      )}

      <div className="z-50 flex w-full shrink-0 flex-row items-center justify-center gap-2 pt-[7dvh] text-lg font-medium">
        <img src="./logo.png" className="h-5 shrink-0 invert" />
        <div>MUZZiC</div>
      </div>

      <div style={{ opacity: +showLyrics }} className="z-50 flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden py-7">
        <Lyrics lyrics={state.current!.lyrics} key={state.current?.id} />
      </div>

      <div className="z-50 flex h-[30dvh] w-full shrink-0 flex-col items-center justify-between pb-5">
        <div className="flex h-fit w-fit flex-row items-center gap-2 rounded-full bg-(--accent-color)/10 px-5 py-2 text-[11px]">
          <BsPerson />
          {state.current?.artists[0]}
        </div>

        <div className="flex h-20 w-[70%] items-center">
          <div className="w-full min-w-0 flex-1 shrink-0 truncate text-center text-5xl leading-tight font-bold text-nowrap">{state.current?.title}</div>
        </div>

        <div className="flex h-fit w-xl flex-col items-center justify-center gap-6">
          <PlaybackControls isFullscreen setGradient={setShowLyrics} index={index} setQueue={setQueue} isPlaying={state.isPlaying} loading={!!(state.current && !state.duration)} />
          <Progressbar isFullscreen />
        </div>
      </div>
    </div>
  );
});
