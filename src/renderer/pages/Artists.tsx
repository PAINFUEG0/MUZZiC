/** @format */

import { TbMicrophone2 } from "react-icons/tb";
import { Card } from "../components/utils/Card";
import { IoIosArrowBack } from "react-icons/io";
import { Track } from "../components/utils/Track";
import { useState, useRef, useEffect } from "react";
import { chunk, flatten } from "../../shared/helpers";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ThumbGrid } from "../components/utils/ThumbGrid";
import { likedSongsStore, searchBox, treeStore } from "../utils/globalStores";
import { RiErrorWarningLine } from "react-icons/ri";

export function Artists() {
  type Row = { type: "tracks"; data: NonNullable<(typeof artists)[keyof typeof artists]> } | { type: "artists"; data: string[][] };

  const [data] = treeStore.use();
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const flat = flatten(data);
  let artists = { ...Object.groupBy(flat, (e) => e.artists[0]!) };

  const T = Object.groupBy(flat, (e) => e.artists.join(", "));
  for (const artist in T)
    if (artists[artist] === undefined) artists[artist] = T[artist];
    else artists[artist] = Array.from(new Set([...artists[artist], ...T[artist]!]));

  artists = Object.fromEntries(Object.entries(artists).sort((a, b) => a[0].localeCompare(b[0])));

  const [selected, setSelected] = useState<string | null>(null);
  const [rows, setRows] = useState<Row>({ type: "artists", data: chunk(Object.keys(artists), 6) });

  const virtualizer = useVirtualizer({
    overscan: 5,
    estimateSize: () => 50,
    count: rows.data.length,
    getScrollElement: () => scrollRef.current,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const maskImage =
    atTop && atBottom
      ? "none"
      : atTop
        ? "linear-gradient(to bottom, black 95%, transparent 100%)"
        : atBottom
          ? "linear-gradient(to bottom, transparent 0%, black 5%)"
          : "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)";

  useEffect(() => setQuery(""), [selected]);
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [selected]);
  useEffect(
    () => setRows(selected ? { type: "tracks", data: artists[selected]! } : { type: "artists", data: chunk(Object.keys(artists), 6) }),
    [selected],
  );
  useEffect(
    () =>
      void setRows(() => {
        if (!query)
          return selected ? { type: "tracks", data: artists[selected]! } : { type: "artists", data: chunk(Object.keys(artists), 6) };
        if (selected)
          return { type: "tracks", data: artists[selected]!.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) };
        const keys = Object.keys(artists).filter((e) => e.toLowerCase().includes(query.toLowerCase()));
        return { type: "artists", data: chunk(keys, 6) };
      }),
    [query],
  );

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5 ease-in-out">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            onClick={() => setSelected("")}
            children={!selected ? <TbMicrophone2 /> : <IoIosArrowBack />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="flex flex-row items-center gap-1.5 font-medium">
            <div className="cursor-pointer hover:underline" onClick={() => setSelected("")} children="Artists" />
            {selected && <div className="shrink-0" children="/" />}
            {selected && <div className="min-w-0 truncate" children={selected} />}
          </div>
        </div>

        <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{rows.data.flat().length} items</div>
      </div>

      <div
        ref={scrollRef}
        className="flex h-full w-full scrollbar-none flex-col overflow-y-auto"
        onScroll={() => {
          const el = scrollRef.current;
          el && setAtTop(el.scrollTop <= 0);
          el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
        }}
        style={{ maskImage, WebkitMaskImage: maskImage, willChange: "scroll-position" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ height: virtualizer.getTotalSize(), position: "relative" }}
            initial={selected === null ? false : { x: selected ? "20%" : "-20%", opacity: 0 }}
          >
            {virtualizer.getVirtualItems().length === 0 ? (
              <div className="flex h-fit w-full flex-row items-center justify-center gap-2 rounded-md border-2 border-(--border-color)/20 py-5 text-xl font-medium">
                <RiErrorWarningLine className="mt-0.5" />
                <div>No items to display</div>
              </div>
            ) : (
              virtualizer.getVirtualItems().map((vItem) => {
                return (
                  <div
                    key={vItem.index}
                    data-index={vItem.index}
                    ref={virtualizer.measureElement}
                    style={{ top: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px)` }}
                    children={
                      rows.type === "tracks" ? (
                        <Track
                          index={vItem.index}
                          initial={vItem.index === 0}
                          file={rows.data[vItem.index]!}
                          key={rows.data[vItem.index]!.id}
                          end={vItem.index === rows.data.length - 1}
                          isLiked={liked.includes(rows.data[vItem.index]!.id)}
                          onLike={() =>
                            setLiked((liked) =>
                              liked.includes(rows.data[vItem.index]!.id)
                                ? liked.filter((e) => e !== rows.data[vItem.index]!.id)
                                : [...liked, rows.data[vItem.index]!.id],
                            )
                          }
                          onClick={() => console.log({ current: vItem.index, queue: rows.data })}
                        />
                      ) : (
                        <ThumbGrid
                          index={vItem.index}
                          len={rows.data.length}
                          children={rows.data[vItem.index]!.map((artist) => (
                            <Card
                              label1={artist}
                              thumb={artists[artist]![0]!.thumb}
                              onClick={() => setSelected(artist)}
                              label2={`${artists[artist]?.length} track/s`}
                            />
                          ))}
                        />
                      )
                    }
                  />
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
