/** @format */

import { RiHeartLine } from "react-icons/ri";
import { flatten } from "../../shared/helpers";
import { generateIndex } from "../utils/helpers";
import { Track } from "../components/utils/Track";
import { useState, useRef, useEffect } from "react";
import { useVirtualList } from "../hooks/useVirtualList";
import { likedSongsStore, searchBox, treeStore } from "../utils/globalStores";

export function Liked() {
  const [data] = treeStore.use();
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const flat = flatten(data)
    .filter((e) => liked.includes(e.id))
    .sort((a, b) => a.title.localeCompare(b.title));
  const [tracks, setTracks] = useState(flat);
  const index = generateIndex(tracks);

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    list: tracks,
    K: (index) => tracks[index]!.id,
    V: ({ index }) => {
      const track = tracks[index]!;
      return (
        <Track
          file={track}
          index={index}
          key={track.id}
          isLiked={true}
          initial={index === 0}
          end={index === tracks.length - 1}
          onClick={() => console.log({ current: index, queue: tracks })}
          onLike={() => setLiked((liked) => liked.filter((e) => e !== track.id))}
        />
      );
    },
  });

  useEffect(() => setQuery(""), []);
  useEffect(() => setTracks(flat.filter((e) => liked.includes(e.id))), [liked]);
  useEffect(() => void setTracks(query ? flat.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) : flat), [query]);

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            children={<RiHeartLine />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
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
