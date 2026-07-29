/** @format */

import { playerMethods } from "../player";
import { RiHeartLine } from "react-icons/ri";
import { flatten } from "../../shared/helpers";
import { generateIndex } from "../utils/helpers";
import { Track } from "../components/utils/Track";
import { useVirtualList } from "../hooks/useVirtualList";
import { useRef, useEffect, useMemo, useCallback } from "react";
import { likedSongsStore, searchBox, treeStore } from "../utils/stores";

export function Liked() {
  const [data] = treeStore.use();
  const [methods] = playerMethods.use();
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const flat = useMemo(
    () =>
      flatten(data)
        .filter((e) => liked.includes(e.id))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [data, liked],
  );
  const tracks = useMemo(() => (query ? flat.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) : flat), [flat, query]);
  const index = useMemo(() => generateIndex(tracks), [tracks]);

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    list: tracks,
    getItemKey: useCallback((index) => tracks[index]!.id, [tracks]),
    Component: useCallback(
      ({ index }) => {
        const track = tracks[index]!;
        return (
          <Track
            file={track}
            index={index}
            key={track.id}
            isLiked={true}
            initial={index === 0}
            end={index === tracks.length - 1}
            onLike={() => setLiked((liked) => liked.filter((e) => e !== track.id))}
            onClick={() => (methods.destroy(), methods.jumpTo(flat.findIndex((t) => t.id === tracks[index]!.id)), methods.enqueue(flat))}
          />
        );
      },
      [tracks],
    ),
  });

  useEffect(() => setQuery(""), []);

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button children={<RiHeartLine />} className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95" />
          <div className="font-medium">Liked songs</div>
        </div>

        <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{tracks.length} items</div>
      </div>

      <div className="flex h-full w-full flex-row gap-2 overflow-hidden">
        <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto" children={list} />

        <div className="flex h-full w-5 flex-col items-center justify-between overflow-hidden rounded-sm border-2 border-(--border-color)/20 py-1 text-[10px]">
          {index.map((e, i) => (
            <div
              key={i}
              children={e.label}
              onClick={() => e.status && virtualizer.scrollToIndex(e.index - 1, { align: "start" })}
              className={"text-(--accent-color) " + (e.status ? "cursor-pointer opacity-100" : "opacity-50")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
