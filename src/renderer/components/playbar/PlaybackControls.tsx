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
          : { id: "queue-button", Icon: <LU.LuList className="opacity-70 hover:opacity-100" />, onclick: () => setScene({ scene: "queue" }) },
        { id: "seekBackward-button", Icon: <LU.LuFastForward className="rotate-180 opacity-70 hover:opacity-100" />, onclick: methods.seekBackward },
        { id: "prev-button", Icon: <LU.LuSkipBack className="opacity-70 hover:opacity-100" />, onclick: methods.prev },
        loading
          ? { id: "play-pause-button", Icon: <LU.LuLoaderCircle className="animate-spin" /> }
          : isPlaying
            ? { id: "play-pause-button", Icon: <LU.LuPause className="opacity-70 hover:opacity-100" />, onclick: methods.pause }
            : { id: "play-pause-button", Icon: <LU.LuPlay className="opacity-70 hover:opacity-100" />, onclick: methods.resume },
        { id: "skip-button", Icon: <LU.LuSkipForward className="opacity-70 hover:opacity-100" />, onclick: methods.skip },
        { id: "seekForward-button", Icon: <LU.LuFastForward className="opacity-70 hover:opacity-100" />, onclick: methods.seekForward },
        {
          id: "shuffle-button",
          Icon: <LU.LuShuffle className="text-[15px] opacity-70 hover:opacity-100" />,
          onclick: () => setQueue((q) => [...q.slice(0, index + 1), ...q.slice(index + 1).sort(() => Math.random() - 0.5)]),
        },
      ].map(({ id, Icon, onclick }, i) => (
        <button id={id} key={i} children={Icon} onClick={onclick} className={`cursor-pointer p-px active:scale-85 ` + (isFullscreen ? "hover:text-white" : "hover:text-(--accent-color)")} />
      ))}
    </div>
  );
});
