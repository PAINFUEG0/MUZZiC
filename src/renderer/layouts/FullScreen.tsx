/** @format */

import { memo } from "react";
import { BsPerson } from "react-icons/bs";
import { themeStore } from "../stores/theme";
import { FaAngleDown } from "react-icons/fa6";
import { Progressbar } from "../components/playbar/Progressbar";
import { playerState, playerIndex, playerQueue } from "../stores";
import { PlaybackControls } from "../components/playbar/PlaybackControls";

export const Fullscreen = memo(({ setShow }: { setShow: (arg: boolean) => void }) => {
  const [theme] = themeStore.use();
  const [index] = playerIndex.use();
  const [state] = playerState.use();
  const [, setQueue] = playerQueue.use();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden text-white">
      <div onClick={() => setShow(false)} className="absolute top-0 right-0 z-100 shrink-0 cursor-pointer p-5 text-xl opacity-10 hover:opacity-70" children={<FaAngleDown />} />

      <img
        key={state.current?.id}
        onError={(e) => (e.currentTarget.src = theme.background)}
        src={state.current?.thumb.replace("thumbnail.", "artwork.")}
        className="absolute inset-0 z-20 h-full w-full scale-115 object-cover"
      />

      <div className="absolute inset-0 z-30 h-full w-full bg-black/10 backdrop-blur-none" />

      <div
        className="absolute bottom-0 z-50 h-[50%] w-full backdrop-blur-3xl"
        style={{
          maskImage: "linear-gradient(to top, black 0%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)",
        }}
      />

      <div className="absolute bottom-0 z-50 h-[50%] w-full" style={{ backgroundImage: "linear-gradient(to top, black 0%, black 5%, rgba(0,0,0,0.6) 50%, transparent 100%)" }} />

      <div className="z-50 flex h-[15dvh] w-full shrink-0 flex-row items-center justify-center gap-2 text-lg font-medium">
        <img src="./logo.png" className="h-5 shrink-0 invert" />
        <div>MUZZiC</div>
      </div>

      <div className="z-50 flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden text-4xl font-bold font-stretch-200%">
        {/* {state.current?.lyrics
          .split("[")
          .slice(0, 5)
          .map((l, i) => (
            <div key={i} className="flex h-fit w-full flex-row items-center justify-center">
              {l}
            </div>
          ))} */}
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
          <PlaybackControls index={index} setQueue={setQueue} isPlaying={state.isPlaying} loading={!!(state.current && !state.duration)} />
          <Progressbar />
        </div>
      </div>
    </div>
  );
});
