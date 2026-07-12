/** @format */

import { LuDisc } from "react-icons/lu";
import { flatten } from "../../shared/helpers";
import { Track } from "../components/utils/Track";
import { useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { likedSongsStore, searchBox, treeStore } from "../utils/globalStores";

export function Liked() {
  const [data] = treeStore.use();
  const [atTop, setAtTop] = useState(true);
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();
  const [atBottom, setAtBottom] = useState(false);

  const maskImage =
    atTop && atBottom
      ? "none"
      : atTop
        ? "linear-gradient(to bottom, black 95%, transparent 100%)"
        : atBottom
          ? "linear-gradient(to bottom, transparent 0%, black 5%)"
          : "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)";

  const flat = flatten(data).filter((e) => liked.includes(e.id));
  const [tracks, setTracks] = useState(flat);

  const virtualizer = useVirtualizer({
    overscan: 5,
    count: tracks.length,
    estimateSize: () => 50,
    getScrollElement: () => scrollRef.current,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  useEffect(() => setQuery(""), []);
  useEffect(() => void setTracks(query ? flat.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) : flat), [query]);

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            children={<LuDisc />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="font-medium">Liked songs</div>
        </div>

        <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{tracks.length} items</div>
      </div>

      <div
        ref={scrollRef}
        style={{ maskImage, WebkitMaskImage: maskImage, willChange: "scroll-position" }}
        onScroll={() => {
          const el = scrollRef.current;
          el && setAtTop(el.scrollTop <= 0);
          el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
        }}
        className="flex h-full w-full scrollbar-none flex-col overflow-y-auto"
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const track = tracks[vItem.index]!;

            return (
              <div
                key={track.id}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                style={{ top: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px)` }}
              >
                <Track
                  file={track}
                  key={track.id}
                  isLiked={true}
                  index={vItem.index}
                  initial={vItem.index === 0}
                  end={vItem.index === tracks.length - 1}
                  onClick={() => console.log({ current: vItem.index, queue: tracks })}
                  onLike={() => setLiked((liked) => liked.filter((e) => e !== track.id))}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
