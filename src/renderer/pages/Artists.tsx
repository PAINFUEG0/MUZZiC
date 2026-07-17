/** @format */

import { TbMicrophone2 } from "react-icons/tb";
import { Card } from "../components/utils/Card";
import { IoIosArrowBack } from "react-icons/io";
import { Track } from "../components/utils/Track";
import { chunk, flatten } from "../../shared/helpers";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualList } from "../hooks/useVirtualList";
import { ThumbGrid } from "../components/utils/ThumbGrid";
import { likedSongsStore, searchBox, treeStore } from "../utils/stores";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

export function Artists() {
  type Row = ArtistRow | TrackRow;
  type ArtistRow = { type: "artists"; data: string[][] };
  type TrackRow = { type: "tracks"; data: NonNullable<(typeof artists)[keyof typeof artists]> };

  const [data] = treeStore.use();
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const artists = useMemo(() => {
    const flat = flatten(data);
    const _artists = { ...Object.groupBy(flat, (e) => e.artists[0]!) };

    const T = Object.groupBy(flat, (e) => e.artists.join(", "));
    for (const artist in T)
      if (_artists[artist] === undefined) _artists[artist] = T[artist];
      else _artists[artist] = Array.from(new Set([..._artists[artist], ...T[artist]!]));

    return Object.fromEntries(Object.entries(_artists).sort((a, b) => a[0].localeCompare(b[0])));
  }, [data]);

  const [selected, setSelected] = useState<string | null>(null);
  const [rows, setRows] = useState<Row>({ type: "artists", data: chunk(Object.keys(artists), 6) });

  const makeGrid = useCallback(
    (rows: ArtistRow, index: number) => (
      <ThumbGrid
        index={index}
        len={rows.data.length}
        children={rows.data[index]!.map((artist) => (
          <Card
            label1={artist}
            thumb={artists[artist]![0]!.thumb}
            onClick={() => setSelected(artist)}
            label2={`${artists[artist]?.length} track/s`}
          />
        ))}
      />
    ),
    [rows, artists],
  );

  const makeTrack = useCallback(
    (rows: TrackRow, index: number) => (
      <Track
        index={index}
        initial={index === 0}
        file={rows.data[index]!}
        key={rows.data[index]!.id}
        end={index === rows.data.length - 1}
        isLiked={liked.includes(rows.data[index]!.id)}
        onLike={() =>
          setLiked((liked) =>
            liked.includes(rows.data[index]!.id) ? liked.filter((e) => e !== rows.data[index]!.id) : [...liked, rows.data[index]!.id],
          )
        }
        onClick={() => console.log({ current: index, queue: rows.data })}
      />
    ),
    [liked, rows],
  );

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    getItemKey: (index) => index,
    list: rows.data as any[],
    Component: ({ index }) => (rows.type === "artists" ? makeGrid(rows, index) : makeTrack(rows, index)),
  });

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
            onClick={() => setSelected((_) => (_ === null ? null : ""))}
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

      <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            children={list}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            initial={selected === null ? false : { x: selected ? "20%" : "-20%", opacity: 0 }}
            style={{ height: rows.data.length ? virtualizer.getTotalSize() : "100%", position: "relative" }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
