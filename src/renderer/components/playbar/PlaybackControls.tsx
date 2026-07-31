/** @format */

import { memo } from "react";
import * as LU from "react-icons/lu";
import { sceneStore } from "../../stores";
import { playerMethods, playerQueue } from "../../player";

type T = ReturnType<(typeof playerQueue)["use"]>;
type Props = { setQueue: T[1]; loading: boolean; isPlaying: boolean; index: number };

export const PlaybackControls = memo(({ setQueue, loading, isPlaying, index }: Props) => {
  const [, setScene] = sceneStore.use();
  const [methods] = playerMethods.use();

  return (
    <div className="mt-2 flex w-full flex-row items-center justify-center gap-5">
      {[
        { Icon: <LU.LuList />, onclick: () => setScene({ scene: "queue" }) },
        { Icon: <LU.LuFastForward className="rotate-180" />, onclick: methods.seekBackward },
        { Icon: <LU.LuSkipBack />, onclick: methods.prev },
        loading ? { Icon: <LU.LuLoaderCircle className="animate-spin" /> } : isPlaying ? { Icon: <LU.LuPause />, onclick: methods.pause } : { Icon: <LU.LuPlay />, onclick: methods.resume },
        { Icon: <LU.LuSkipForward />, onclick: methods.skip },
        { Icon: <LU.LuFastForward />, onclick: methods.seekForward },
        {
          Icon: <LU.LuShuffle className="text-[15px]" />,
          onclick: () => setQueue((q) => [...q.slice(0, index + 1), ...q.slice(index + 1).sort(() => Math.random() - 0.5)]),
        },
      ].map(({ Icon, onclick }, i) => (
        <button key={i} children={Icon} onClick={onclick} className="cursor-pointer p-px hover:text-(--accent-color) active:scale-85" />
      ))}
    </div>
  );
});
