/** @format */

import { LuDisc } from "react-icons/lu";
import { flatten } from "../../shared/helpers";
import { generateIndex } from "../utils/helpers";
import { Track } from "../components/utils/Track";
import { useState, useRef, useEffect } from "react";
import { useVirtualList } from "../hooks/useVirtualList";
import { likedSongsStore, searchBox, treeStore } from "../utils/globalStores";

export function Tracks() {
  const [data] = treeStore.use();
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const flat = flatten(data).sort((a, b) => a.title.localeCompare(b.title));
  const [tracks, setTracks] = useState(flat);
  const index = generateIndex(tracks);

  useEffect(() => setQuery(""), []);
  useEffect(() => void setTracks(query ? flat.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) : flat), [query]);

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    list: tracks,
    K: (index) => tracks[index]!.id,
    V: ({ index }) => (
      <Track
        index={index}
        file={tracks[index]!}
        initial={index === 0}
        key={tracks[index]!.id}
        end={index === tracks.length - 1}
        isLiked={liked.includes(tracks[index]!.id)}
        onClick={() => console.log({ current: index, queue: tracks })}
        onLike={() =>
          setLiked((liked) =>
            liked.includes(tracks[index]!.id) ? liked.filter((e) => e !== tracks[index]!.id) : [...liked, tracks[index]!.id],
          )
        }
      />
    ),
  });

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            children={<LuDisc />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="font-medium">Playable tracks</div>
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
              className={"cursor-pointer text-(--accent-color) " + (e.status ? "opacity-100" : "opacity-50")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
