/** @format */

import { playerMethods } from "../player";
import { LuDisc, LuInfo } from "react-icons/lu";
import { generateIndex } from "../utils/helpers";
import { Modal } from "../components/utils/Modal";
import { Track } from "../components/utils/Track";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { useVirtualList } from "../hooks/useVirtualList";
import { TrackInfo } from "../components/utils/TrackInfo";
import { useRef, useMemo, useCallback, useState } from "react";
import { SelectActions } from "../components/utils/SelectActions";
import { flattenedTreeStore, likedSongsStore, searchBox, selectMode } from "../stores";

export function Tracks() {
  const [query] = searchBox.use();
  const [methods] = playerMethods.use();
  const [inSelectionMode] = selectMode.use();
  const [info, setInfo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const [flat] = flattenedTreeStore.use();
  const tracks = useMemo(() => (query ? flat.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) : flat), [flat, query]);
  const index = useMemo(() => generateIndex(tracks), [tracks]);
  const likedMap = useMemo(() => Object.fromEntries(liked.map((_) => [_, true])), [liked]);

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    list: tracks,
    getItemKey: useCallback((index) => tracks[index]!.id, [tracks]),
    Component: useCallback(
      ({ index }) => (
        <Track
          index={index}
          file={tracks[index]!}
          initial={index === 0}
          key={tracks[index]!.id}
          end={index === tracks.length - 1}
          isLiked={!!likedMap[tracks[index]!.id]}
          button1={<BiAddToQueue className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => methods.enqueue([tracks[index]!])} />}
          button2={<BiTrash className="shrink-0 cursor-pointer opacity-40" />}
          button3={<LuInfo className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => setInfo(tracks[index]!)} />}
          onClick={() => (methods.destroy(), methods.jumpTo(flat.findIndex((t) => t.id === tracks[index]!.id)), methods.enqueue(flat))}
          onLike={() => setLiked((_) => (_.includes(tracks[index]!.id) ? _.filter((e) => e !== tracks[index]!.id) : [..._, tracks[index]!.id]))}
        />
      ),
      [tracks, likedMap],
    ),
  });

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button children={<LuDisc />} className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95" />
          <div className="font-medium">Playable tracks</div>
        </div>

        {!inSelectionMode && <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{tracks.length} items</div>}

        <SelectActions />
      </div>

      <div className="flex h-full w-full flex-row gap-2 overflow-hidden">
        <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto" children={list} />

        <div className="flex h-full w-5 flex-col items-center justify-between overflow-hidden rounded-sm border-2 border-(--border-color)/20 py-1 text-[10px]">
          {index.map((e, i) => (
            <div
              key={i}
              children={e.label}
              onClick={() => e.status && virtualizer.scrollToIndex(e.index - 1, { align: "start" })}
              className={"cursor-pointer text-(--accent-color) " + (e.status ? "opacity-100" : "opacity-50")}
            />
          ))}
        </div>
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
