/** @format */

import { LuInfo } from "react-icons/lu";
import { playerMethods } from "../player";
import { TbMicrophone2 } from "react-icons/tb";
import { Card } from "../components/utils/Card";
import { IoIosArrowBack } from "react-icons/io";
import { Track } from "../components/utils/Track";
import { Modal } from "../components/utils/Modal";
import { chunk, flatten } from "../../shared/helpers";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualList } from "../hooks/useVirtualList";
import { TrackInfo } from "../components/utils/TrackInfo";
import { ThumbGrid } from "../components/utils/ThumbGrid";
import { SelectActions } from "../components/utils/SelectActions";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { likedSongsStore, searchBox, selectMode, treeStore } from "../stores";

export function Artists() {
  type Row = ArtistRow | TrackRow;
  type ArtistRow = { type: "artists"; data: string[][] };
  type TrackRow = { type: "tracks"; data: NonNullable<(typeof artists)[keyof typeof artists]> };

  const [data] = treeStore.use();
  const [methods] = playerMethods.use();
  const [query, setQuery] = searchBox.use();
  const [inSelectionMode] = selectMode.use();
  const [info, setInfo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const likedMap = useMemo(() => Object.fromEntries(liked.map((_) => [_, true])), [liked]);

  const artists = useMemo(() => {
    const flat = flatten(data);
    const _artists = { ...Object.groupBy(flat, (e) => e.artists[0]!) };

    const T = Object.groupBy(flat, (e) => e.artists.join(", "));
    for (const artist in T)
      if (_artists[artist] === undefined) _artists[artist] = T[artist];
      else _artists[artist] = Array.from(new Set([..._artists[artist], ...T[artist]!]));

    return Object.fromEntries(Object.entries(_artists).sort((a, b) => a[0].localeCompare(b[0])));
  }, [data]);

  const [isTrackView, setIsTrackView] = useState<string | null>(null);
  const [rows, setRows] = useState<Row>({ type: "artists", data: chunk(Object.keys(artists), 6) });

  const makeGrid = useCallback(
    (data: ArtistRow["data"], index: number) => (
      <ThumbGrid
        index={index}
        len={data.length}
        children={data[index]!.map((artist) => (
          <Card label1={artist} thumb={artists[artist]![0]!.thumb} onClick={() => setIsTrackView(artist)} label2={`${artists[artist]?.length} track/s`} />
        ))}
      />
    ),
    [artists],
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
        onLike={() => setLiked((liked) => (liked.includes(data[index]!.id) ? liked.filter((e) => e !== data[index]!.id) : [...liked, data[index]!.id]))}
        onClick={() => (methods.destroy(), methods.jumpTo(index), methods.enqueue(data))}
      />
    ),
    [likedMap],
  );

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    overscan: 2,
    list: rows.data as any[],
    Component: useCallback(({ index }) => (rows.type === "artists" ? makeGrid(rows.data, index) : makeTrack(rows.data, index)), [rows, makeGrid, makeTrack]),
    getItemKey: useCallback((index) => (rows.type === "tracks" ? rows.data[index]!.id : rows.data[index]!.join(", ")), [rows]),
  });

  useEffect(() => setQuery(""), [isTrackView]);
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [isTrackView]);
  useEffect(() => setRows(isTrackView ? { type: "tracks", data: artists[isTrackView]! } : { type: "artists", data: chunk(Object.keys(artists), 6) }), [isTrackView]);
  useEffect(
    () =>
      void setRows(() => {
        if (!query) return isTrackView ? { type: "tracks", data: artists[isTrackView]! } : { type: "artists", data: chunk(Object.keys(artists), 6) };
        if (isTrackView) return { type: "tracks", data: artists[isTrackView]!.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) };
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
            onClick={() => setIsTrackView((_) => (_ === null ? null : ""))}
            children={!isTrackView ? <TbMicrophone2 /> : <IoIosArrowBack />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="flex flex-row items-center gap-1.5 font-medium">
            <div className="cursor-pointer hover:underline" onClick={() => setIsTrackView("")} children="Artists" />
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
