/** @format */

import { AnimatePresence, motion } from "framer-motion";
import { Card } from "../components/utils/Card";
import { IoIosArrowBack } from "react-icons/io";
import { Track } from "../components/utils/Track";
import { RiFolderMusicLine } from "react-icons/ri";
import { useState, useRef, useEffect } from "react";
import { chunk, flatten } from "../../shared/helpers";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ThumbGrid } from "../components/utils/ThumbGrid";
import { searchBox, treeStore } from "../utils/globalStores";

export function Albums() {
  type Row = { type: "tracks"; data: NonNullable<(typeof albums)[keyof typeof albums]> } | { type: "albums"; data: string[][] };

  const [data] = treeStore.use();
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);

  const flat = flatten(data);
  const albums = Object.groupBy(flat, (e) => e.album);
  const [selected, setSelected] = useState<string | null>(null);
  const [rows, setRows] = useState<Row>({ type: "albums", data: chunk(Object.keys(albums), 6) });

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
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [rows]);
  useEffect(
    () => setRows(selected ? { type: "tracks", data: albums[selected]! } : { type: "albums", data: chunk(Object.keys(albums), 6) }),
    [selected],
  );
  useEffect(
    () =>
      void setRows(() => {
        if (!query) return selected ? { type: "tracks", data: albums[selected]! } : { type: "albums", data: chunk(Object.keys(albums), 6) };
        if (selected)
          return { type: "tracks", data: albums[selected]!.filter((track) => track.title.toLowerCase().includes(query.toLowerCase())) };
        const keys = Object.keys(albums).filter(
          (album) =>
            album.toLowerCase().includes(query.toLowerCase()) ||
            albums[album]
              ?.flatMap((track) => track.artists)
              .toString()
              .toLowerCase()
              .includes(query.toLowerCase()),
        );
        return { type: "albums", data: chunk(keys, 6) };
      }),
    [query],
  );

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5 ease-in-out">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            onClick={() => setSelected("")}
            children={!selected ? <RiFolderMusicLine /> : <IoIosArrowBack />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="flex flex-row items-center gap-1.5 font-medium">
            <div className="cursor-pointer hover:underline" onClick={() => setSelected("")} children="Albums" />
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
            animate={{ x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ height: virtualizer.getTotalSize(), position: "relative" }}
            initial={selected === null ? false : { x: selected ? "20%" : "-20%" }}
          >
            {virtualizer.getVirtualItems().map((vItem) => {
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
                        onClick={() => console.log(rows.data[vItem.index]!.path)}
                      />
                    ) : (
                      <ThumbGrid
                        index={vItem.index}
                        len={rows.data.length}
                        children={rows.data[vItem.index]!.map((album) => (
                          <Card
                            label1={album}
                            thumb={albums[album]![0]!.thumb}
                            onClick={() => setSelected(album)}
                            label2={
                              albums[album]
                                ?.flatMap((track) => track.artists)
                                .filter((artist) => artist.toLowerCase() !== "unknown artists")
                                .filter((artist, i, arr) => arr.indexOf(artist) == i)
                                .join(", ") || "Unknown Artists"
                            }
                          />
                        ))}
                      />
                    )
                  }
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
