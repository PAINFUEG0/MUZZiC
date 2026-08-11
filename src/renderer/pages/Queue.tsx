/** @format */

import { likedSongsStore } from "../stores";
import { Modal } from "../components/utils/Modal";
import { Track } from "../components/utils/Track";
import { LuInfo, LuListMusic } from "react-icons/lu";
import { BiTrash, BiAddToQueue } from "react-icons/bi";
import { useVirtualList } from "../hooks/useVirtualList";
import { TrackInfo } from "../components/utils/TrackInfo";
import { useRef, useCallback, useMemo, useState } from "react";
import { SelectActions } from "../components/utils/SelectActions";
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
        button1={<BiAddToQueue className="shrink-0 cursor-pointer opacity-40" />}
        button2={
          <BiTrash
            onClick={() => index > currentIndex && setQueue((_) => _.filter((__) => __.id !== _[index]!.id))}
            className={"shrink-0 transition-all duration-100 active:scale-90 " + (index > currentIndex ? "cursor-pointer opacity-100" : "opacity-40")}
          />
        }
        button3={<LuInfo className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => setInfo(queue[index]!)} />}
      />
    ),
    [queue, liked, currentIndex],
  );

  const [list, virtualizer] = useVirtualList({ scrollRef, list: queue, getItemKey: (index) => index.toString(), Component });

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button children={<LuListMusic />} className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95" />
          <div className="font-medium">Playaback queue</div>
        </div>

        <div
          onClick={() => virtualizer.scrollToIndex(currentIndex - 1, { align: "start" })}
          className="mx-1 flex h-fit w-fit cursor-pointer items-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
        >
          <div>Jump to current</div>
          <div className="text-center text-[10px]" children="(" />
          <div className="mt-px text-center text-[10px]" children={currentIndex + 1} />
          <div className="mt-px text-center text-[10px]" children="/" />
          <div className="mt-px text-center text-[10px]" children={queue.length} />
          <div className="text-center text-[10px]" children=")" />
        </div>

        <div
          children="Dedupe Queue"
          onClick={() => setQueue((_) => [..._.slice(0, currentIndex + 1), ...Array.from(new Set(_.slice(currentIndex + 1)))])}
          className="mx-1 flex h-fit w-fit cursor-pointer rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
        />

        <div
          children="Clear Queue"
          onClick={methods.destroy}
          className="mx-1 flex h-fit w-fit cursor-pointer rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
        />

        <SelectActions competeList={queue.map((_) => _.id)} />
      </div>

      <div className="flex h-full w-full flex-row gap-2 overflow-hidden">
        <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto" children={list} />
      </div>

      <Modal
        open={!!info}
        setOpen={() => setInfo(null)}
        children={<TrackInfo track={info!} />}
        className="flex h-fit w-[50dvw] shrink-0 overflow-hidden border-2 border-(--border-color)/20 bg-(--hover-color)/25 p-5 text-(--text-color)"
      />
    </div>
  );
}
