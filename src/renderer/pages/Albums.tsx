/** @format */

import { LuInfo } from "react-icons/lu";
import { playerMethods } from "../player";
import { Card } from "../components/utils/Card";
import { IoIosArrowBack } from "react-icons/io";
import { Modal } from "../components/utils/Modal";
import { Track } from "../components/utils/Track";
import { RiFolderMusicLine } from "react-icons/ri";
import { chunk, flatten } from "../../shared/helpers";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualList } from "../hooks/useVirtualList";
import { ThumbGrid } from "../components/utils/ThumbGrid";
import { TrackInfo } from "../components/utils/TrackInfo";
import { SelectActions } from "../components/utils/SelectActions";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { likedSongsStore, searchBox, selectMode, treeStore } from "../stores";

export function Albums() {
  type Row = AlbumRow | TrackRow;
  type AlbumRow = { type: "albums"; data: string[][] };
  type TrackRow = { type: "tracks"; data: NonNullable<(typeof albums)[keyof typeof albums]> };

  const [tree] = treeStore.use();
  const [methods] = playerMethods.use();
  const [query, setQuery] = searchBox.use();
  const [inSelectionMode] = selectMode.use();
  const [info, setInfo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const albums = useMemo(() => {
    const flat = flatten(tree).sort((a, b) => a.album.localeCompare(b.album));
    return Object.groupBy(flat, (e) => e.album);
  }, [tree]);

  const [liked, setLiked] = likedSongsStore.use();
  const [isTrackView, setIsTrackView] = useState<string | null>(null);
  const [rows, setRows] = useState<Row>({ type: "albums", data: chunk(Object.keys(albums), 6) });

  const likedMap = useMemo(() => Object.fromEntries(liked.map((_) => [_, true])), [liked]);

  useEffect(() => setQuery(""), [isTrackView]);
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [isTrackView]);
  useEffect(() => setRows(isTrackView ? { type: "tracks", data: albums[isTrackView]! } : { type: "albums", data: chunk(Object.keys(albums), 6) }), [isTrackView]);
  useEffect(
    () =>
      void setRows(() => {
        if (!query) return isTrackView ? { type: "tracks", data: albums[isTrackView]! } : { type: "albums", data: chunk(Object.keys(albums), 6) };
        if (isTrackView) return { type: "tracks", data: albums[isTrackView]!.filter((track) => track.title.toLowerCase().includes(query.toLowerCase())) };

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
    (data: AlbumRow["data"], index: number) => (
      <ThumbGrid
        index={index}
        len={data.length}
        children={data[index]!.map((album) => (
          <Card
            label1={album}
            thumb={albums[album]![0]!.thumb}
            onClick={() => setIsTrackView(album)}
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
    [albums],
  );

  const makeTrack = useCallback(
    (data: TrackRow["data"], index: number) => (
      <Track
        index={index}
        file={data[index]!}
        key={data[index]!.id}
        initial={index === 0}
        end={index === data.length - 1}
        isLiked={!!likedMap[data[index]!.id]}
        button1={<BiAddToQueue className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => methods.enqueue([data[index]!])} />}
        button2={<BiTrash className="shrink-0 cursor-pointer opacity-40" />}
        button3={<LuInfo className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => setInfo(data[index]!)} />}
        onClick={() => (methods.destroy(), methods.jumpTo(index), methods.enqueue(data))}
        onLike={() => setLiked((liked) => (liked.includes(data[index]!.id) ? liked.filter((e) => e !== data[index]!.id) : [...liked, data[index]!.id]))}
      />
    ),
    [likedMap],
  );

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    overscan: 2,
    list: rows.data as any[],
    Component: useCallback(({ index }) => (rows.type === "tracks" ? makeTrack(rows.data, index) : makeGrid(rows.data, index)), [makeGrid, makeTrack, rows]),
    getItemKey: useCallback((index) => (rows.type === "tracks" ? rows.data[index]!.id : rows.data[index]!.join(", ")), [rows]),
  });

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5 ease-in-out">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            onClick={() => setIsTrackView((_) => (_ === null ? null : ""))}
            children={!isTrackView ? <RiFolderMusicLine /> : <IoIosArrowBack />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="flex flex-row items-center gap-1.5 font-medium">
            <div className="cursor-pointer hover:underline" onClick={() => setIsTrackView("")} children="Albums" />
            {isTrackView && <div className="shrink-0" children="/" />}
            {isTrackView && <div className="min-w-0 truncate" children={isTrackView} />}
          </div>
        </div>

        {!inSelectionMode && <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{rows.data.flat().length} items</div>}
        <SelectActions competeList={rows.type === "tracks" ? rows.data.flat().map((_) => _.id) : undefined} />
      </div>

      <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={isTrackView}
            children={list}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            initial={isTrackView === null ? false : { x: isTrackView ? "20%" : "-20%", opacity: 0 }}
            style={{ height: rows.data.length ? virtualizer.getTotalSize() : "100%", position: "relative" }}
          />
        </AnimatePresence>
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
