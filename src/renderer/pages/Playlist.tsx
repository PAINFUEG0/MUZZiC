/** @format */

import { LuInfo } from "react-icons/lu";
import { playerMethods } from "../player";
import { flatten } from "../../shared/helpers";
import { generateIndex } from "../utils/helpers";
import { Modal } from "../components/utils/Modal";
import { Track } from "../components/utils/Track";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { useVirtualList } from "../hooks/useVirtualList";
import { TrackInfo } from "../components/utils/TrackInfo";
import { useRef, useMemo, useCallback, useState, memo } from "react";
import { SelectActions } from "../components/utils/SelectActions";
import { likedSongsStore, playlistDataStore, playlistStore, sceneStore, searchBox, selectMode, treeStore } from "../stores";
import { PiMusicNoteBold } from "react-icons/pi";
import { MdWarning } from "react-icons/md";

export const Playlist = memo(({ K }: { K: string }) => {
  const [tree] = treeStore.use();
  const [query] = searchBox.use();
  const [methods] = playerMethods.use();
  const [, setScene] = sceneStore.use();
  const [info, setInfo] = useState<any>(null);
  const [inSelectionMode] = selectMode.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();
  const [data, setData] = playlistDataStore.use();
  const [playLists, setPlaylists] = playlistStore.use();

  const flat = useMemo(
    () =>
      flatten(tree)
        .filter((e) => data[K]!.includes(e.id))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [tree, data, K, liked],
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
            initial={index === 0}
            isLiked={liked.includes(track.id)}
            button1={<BiAddToQueue className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => methods.enqueue([tracks[index]!])} />}
            button2={
              <BiTrash className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => setData((data) => ({ ...data, [K]: data[K]!.filter((t) => t !== track.id) }))} />
            }
            button3={<LuInfo className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => setInfo(tracks[index]!)} />}
            end={index === tracks.length - 1}
            onLike={() => setLiked((liked) => (liked.includes(track.id) ? liked.filter((e) => e !== track.id) : [...liked, track.id]))}
            onClick={() => (methods.destroy(), methods.jumpTo(flat.findIndex((t) => t.id === tracks[index]!.id)), methods.enqueue(flat))}
          />
        );
      },
      [tracks],
    ),
  });

  const [show, setShow] = useState(false);

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button children={<PiMusicNoteBold />} className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95" />
          <div className="font-medium">{playLists.find((p) => p.K == K)!.name}</div>
        </div>

        {!inSelectionMode && <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{tracks.length} items</div>}
        {!inSelectionMode && (
          <div children="Delete Playlist" onClick={() => setShow(true)} className="shrink-0 cursor-pointer pr-3 text-xs text-(--accent-color) opacity-90 hover:text-red-500 active:scale-95" />
        )}
        <SelectActions competeList={flat.map((_) => _.id)} />
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

      <Modal
        open={!!info}
        setOpen={() => setInfo(null)}
        children={<TrackInfo track={info!} />}
        className="flex h-fit w-[50dvw] shrink-0 overflow-hidden border-2 border-(--border-color)/20 bg-(--hover-color)/25 p-5 text-(--text-color)"
      />

      <Modal open={show} setOpen={setShow} className="z-100 max-h-fit w-fit border-2 border-(--border-color)/20 bg-(--hover-color)/45 text-(--text-color)">
        <div className="flex flex-col">
          <div className="mb-3 text-xl">Are you sure about that ?</div>

          <div className="align-middle text-xs">
            <LuInfo className="mr-1 mb-1 inline text-sm text-(--accent-color)" />
            <div className="inline opacity-70">This will delete the playlist and all its info.</div>
          </div>
          <div className="mt-px align-middle text-xs">
            <LuInfo className="mr-1 mb-1 inline text-sm text-(--accent-color)" />
            <div className="inline opacity-70">Deleting a playlist will not delete the actual tracks on the disk.</div>
          </div>

          <div className="mt-2 align-middle text-xs">
            <MdWarning className="mr-1 mb-1 inline text-sm text-red-500" />
            <div className="inline opacity-70">This is a non-reversible operation. All changes are permanent. </div>
          </div>

          <div className="mt-5 flex flex-row gap-4 text-xs font-semibold">
            <button
              children="Delete playlist"
              onClick={async () => {
                setScene({ scene: "explorer" });
                setTimeout(() => setPlaylists((_) => _.filter((p) => p.K !== K)), 50);
              }}
              className="w-full cursor-pointer rounded-md border-2 border-[#ff1116] bg-[#ff111622] pt-1 pb-1.5 text-[#ff3333] transition-all duration-150 active:scale-98"
            />
            <button
              children="Cancel operation"
              onClick={() => setShow(false)}
              className="w-full cursor-pointer rounded-md border-2 border-[#31aa16] bg-[#31aa1622] pt-1 pb-1.5 text-[#31ee16] transition-all duration-150 active:scale-98"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
});
