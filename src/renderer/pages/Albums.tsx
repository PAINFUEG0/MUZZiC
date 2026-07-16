/** @format */

import { Card } from "../components/utils/Card";
import { IoIosArrowBack } from "react-icons/io";
import { Track } from "../components/utils/Track";
import { RiFolderMusicLine } from "react-icons/ri";
import { chunk, flatten } from "../../shared/helpers";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualList } from "../hooks/useVirtualList";
import { ThumbGrid } from "../components/utils/ThumbGrid";
import { likedSongsStore, searchBox, treeStore } from "../utils/stores";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

export function Albums() {
  type Row = AlbumRow | TrackRow;
  type AlbumRow = { type: "albums"; data: string[][] };
  type TrackRow = { type: "tracks"; data: NonNullable<(typeof albums)[keyof typeof albums]> };

  const [tree] = treeStore.use();
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const flat = useMemo(() => flatten(tree).sort((a, b) => a.album.localeCompare(b.album)), [tree]);

  const [liked, setLiked] = likedSongsStore.use();
  const albums = Object.groupBy(flat, (e) => e.album);
  const [selected, setSelected] = useState<string | null>(null);
  const [rows, setRows] = useState<Row>({ type: "albums", data: chunk(Object.keys(albums), 6) });

  useEffect(() => setQuery(""), [selected]);
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [selected]);
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

        const keys = Object.keys(albums);
        const matchingAlbums = keys.filter((album) => album.toLowerCase().includes(query.toLowerCase()));
        const matchingArtists = keys.filter((album) =>
          albums[album]!.flatMap((track) => track.artists)
            .toString()
            .toLowerCase()
            .includes(query.toLowerCase()),
        );

        return { type: "albums", data: chunk([...matchingAlbums, ...matchingArtists], 6) };
      }),
    [query],
  );

  const makeGrid = useCallback(
    (rows: AlbumRow, index: number) => (
      <ThumbGrid
        index={index}
        len={rows.data.length}
        children={rows.data[index]!.map((album) => (
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
    ),
    [albums, rows],
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
    Component: ({ index }) => (rows.type === "tracks" ? makeTrack(rows, index) : makeGrid(rows, index)),
  });

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

      <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            children={list}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ height: virtualizer.getTotalSize(), position: "relative" }}
            initial={selected === null ? false : { x: selected ? "20%" : "-20%", opacity: 0 }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
