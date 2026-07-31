/** @format */

import { TrackInfo } from "./TrackInfo";
import { Modal } from "../components/utils/Modal";
import { Track } from "../components/utils/Track";
import { likedSongsStore } from "../utils/stores";
import { LuInfo, LuListMusic } from "react-icons/lu";
import { BiTrash, BiAddToQueue } from "react-icons/bi";
import { useVirtualList } from "../hooks/useVirtualList";
import { useRef, useCallback, useMemo, useState } from "react";
import { playerIndex, playerMethods, playerQueue } from "../player";

export function Queue() {
  const [methods] = playerMethods.use();
  const [currentIndex] = playerIndex.use();
  const [queue, setQueue] = playerQueue.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();
  const [info, setInfo] = useState<(typeof queue)[number] | null>(null);

  const likedMap = useMemo(() => Object.fromEntries(liked.map((_) => [_, true])), [liked]);

  const Component = useCallback(
    ({ index }: { index: number }) => (
      <Track
        index={index}
        file={queue[index]!}
        initial={index === 0}
        key={queue[index]!.id}
        end={index === queue.length - 1}
        isLiked={!!likedMap[queue[index]!.id]}
        isCurrentlyPlaying={index === currentIndex}
        onClick={() => methods.jumpTo(queue.findIndex((t) => t.id === queue[index]!.id))}
        onLike={() => setLiked((liked) => (liked.includes(queue[index]!.id) ? liked.filter((e) => e !== queue[index]!.id) : [...liked, queue[index]!.id]))}
        buttons={
          <div className="flex h-full w-full flex-row items-center justify-between opacity-90">
            <BiAddToQueue className="shrink-0 opacity-40" />
            <BiTrash
              onClick={() => index > currentIndex && setQueue((_) => _.filter((__) => __.id !== _[index]!.id))}
              className={"shrink-0 " + (index > currentIndex ? "cursor-pointer opacity-100" : "opacity-40")}
            />
            <LuInfo className="shrink-0" onClick={() => setInfo(queue[index]!)} />
          </div>
        }
      />
    ),
    [queue, liked, currentIndex],
  );

  const [list] = useVirtualList({ scrollRef, list: queue, getItemKey: useCallback((index) => queue[index]!.id, [queue]), Component });

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button children={<LuListMusic />} className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95" />
          <div className="font-medium">Playaback queue</div>
        </div>

        <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{queue.length} items</div>
      </div>

      <div className="flex h-full w-full flex-row gap-2 overflow-hidden">
        <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto" children={list} />
      </div>

      <Modal
        open={!!info}
        setOpen={() => setInfo(null)}
        children={<TrackInfo track={info!} />}
        className="h-fit w-fit max-w-3xl border-2 border-(--border-color)/20 bg-(--hover-color)/25 text-(--text-color)"
      />
    </div>
  );
}
