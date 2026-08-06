/** @format */

import * as LU from "react-icons/lu";
import { memo } from "react";
import { sceneStore } from "../../stores";
import { playerMethods, playerQueue } from "../../player";

type T = ReturnType<(typeof playerQueue)["use"]>;
type Props = { setQueue: T[1]; loading: boolean; isPlaying: boolean; index: number; isFullscreen?: boolean; setGradient?: React.Dispatch<React.SetStateAction<boolean>> };

export const PlaybackControls = memo(({ setQueue, loading, isPlaying, index, isFullscreen, setGradient }: Props) => {
  const [, setScene] = sceneStore.use();
  const [methods] = playerMethods.use();

  return (
    <div className="mt-2 flex w-full flex-row items-center justify-center gap-5">
      {[
        isFullscreen
          ? { Icon: <LU.LuSwitchCamera className="opacity-70 hover:opacity-100" />, onclick: () => setGradient!((_) => !_) }
          : { Icon: <LU.LuList className="opacity-70 hover:opacity-100" />, onclick: () => setScene({ scene: "queue" }) },
        { Icon: <LU.LuFastForward className="rotate-180 opacity-70 hover:opacity-100" />, onclick: methods.seekBackward },
        { Icon: <LU.LuSkipBack className="opacity-70 hover:opacity-100" />, onclick: methods.prev },
        loading
          ? { Icon: <LU.LuLoaderCircle className="animate-spin" /> }
          : isPlaying
            ? { Icon: <LU.LuPause className="opacity-70 hover:opacity-100" />, onclick: methods.pause }
            : { Icon: <LU.LuPlay className="opacity-70 hover:opacity-100" />, onclick: methods.resume },
        { Icon: <LU.LuSkipForward className="opacity-70 hover:opacity-100" />, onclick: methods.skip },
        { Icon: <LU.LuFastForward className="opacity-70 hover:opacity-100" />, onclick: methods.seekForward },
        {
          Icon: <LU.LuShuffle className="text-[15px] opacity-70 hover:opacity-100" />,
          onclick: () => setQueue((q) => [...q.slice(0, index + 1), ...q.slice(index + 1).sort(() => Math.random() - 0.5)]),
        },
      ].map(({ Icon, onclick }, i) => (
        <button key={i} children={Icon} onClick={onclick} className={`cursor-pointer p-px active:scale-85 ` + (isFullscreen ? "hover:text-white" : "hover:text-(--accent-color)")} />
      ))}
    </div>
  );
});
