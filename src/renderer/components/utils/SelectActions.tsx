/** @format */

import { Modal } from "./Modal";
import { LuInfo } from "react-icons/lu";
import { RiHeartLine } from "react-icons/ri";
import { memo, useRef, useState } from "react";
import { PiMusicNoteBold } from "react-icons/pi";
import { likedSongsStore, playerMethods, playlistDataStore, playlistIndexStore, selected, selectMode } from "../../stores";

import type { Track } from "../../../shared/types";

export const SelectActions = memo(({ list: itemList }: { list?: Track[] }) => {
  const [methods] = playerMethods.use();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const [, setLiked] = likedSongsStore.use();
  const [selections, setSelections] = selected.use();
  const [inSelectionMode, setInSelectionMode] = selectMode.use();
  const [playlistData, setPlaylistData] = playlistDataStore.use();
  const [playlistIndex, setPlaylistIndex] = playlistIndexStore.use();

  if (!inSelectionMode) return null;

  return (
    <div className="flex flex-row">
      <div
        onClick={() => setShow(true)}
        style={{ opacity: selections.length ? 1 : 0.5 }}
        className="mx-1 flex h-fit w-fit cursor-pointer items-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
      >
        <div>Add </div>
        {selections.length > 1 && <div className="mt-px text-center text-[10px]" children={selections.length} />}
        <div>item{selections.length > 1 && "s"} to playlist</div>
      </div>

      <div
        onClick={() => {
          methods.enqueue(selections);
          setInSelectionMode(false);
          setSelections([]);
        }}
        style={{ opacity: selections.length ? 1 : 0.5 }}
        className="mx-1 flex h-fit w-fit cursor-pointer items-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
      >
        <div>Add </div>
        {selections.length > 1 && <div className="mt-px text-center text-[10px]" children={selections.length} />}
        <div>item{selections.length > 1 && "s"} to queue</div>
      </div>

      {!!itemList?.length && (
        <div
          onClick={() => setSelections((_) => Array.from(new Set([..._, ...itemList])))}
          className="mx-1 flex h-fit w-fit cursor-pointer items-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
        >
          <div>Select all</div>
        </div>
      )}

      <div
        children="Cancel"
        onClick={() => (setInSelectionMode(false), setSelections([]))}
        className="mx-1 flex h-fit w-fit cursor-pointer items-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
      />

      <Modal open={show} setOpen={setShow} className="z-100 h-fit w-fit max-w-[50dvw] border-2 border-(--border-color)/20 bg-(--hover-color)/45 text-(--text-color)">
        <div className="flex flex-col">
          <div className="mb-3 text-lg font-medium">Add tracks to playlist</div>

          <div className="flex flex-row items-center gap-1.5 py-2 text-xs">
            <LuInfo className="text-(--accent-color)" />
            <div className="opacity-70">Click on the playlist name to add to an existing playlist</div>
          </div>

          <div className="mb-5 flex flex-row items-center gap-1.5 text-xs">
            <LuInfo className="text-(--accent-color)" />
            <div className="opacity-70">Enter the name for the new playlist and click the button to create a new playlist</div>
          </div>

          <div className="grid max-h-[35dvh] scrollbar-none grid-cols-2 gap-x-2 gap-y-2 overflow-auto">
            {[{ name: "Liked Songs", K: "liked" }, ...playlistIndex].map(({ name, K }) => {
              return (
                <button
                  onClick={() => {
                    if (K === "liked") setLiked((liked) => Array.from(new Set([...liked, ...selections.map((_) => _.id)])));
                    else setPlaylistData((_) => ({ ..._, [K]: Array.from(new Set([...(playlistData[K] || []), ...selections.map((_) => _.id)])) }));
                    setInSelectionMode(false);
                    setSelections([]);
                    setShow(false);
                    setValue("");
                  }}
                  className={
                    "flex h-full w-full cursor-pointer flex-row items-center gap-2 rounded-md border-2 border-(--border-color)/20 p-1 text-xs transition-all duration-150 active:scale-90 " +
                    (K === "liked" ? "col-span-full" : "")
                  }
                >
                  {K === "liked" ? <RiHeartLine className="ml-1 shrink-0" /> : <PiMusicNoteBold className="ml-1 shrink-0" />}
                  <div children={name} className="min-w-0 flex-1 truncate text-start" />
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex h-10 w-full flex-row items-center gap-1 pt-2">
            <div className="relative flex h-full w-full rounded-md border-2 border-(--border-color)/20">
              <input
                ref={ref}
                type="text"
                value={value}
                spellCheck={false}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter name of new playlist"
                onKeyDown={(e) => {
                  e.key.toLowerCase() === "escape" && (e.stopPropagation(), ref.current?.blur(), setValue(""));
                  e.key.toLowerCase() === "enter" && (ref.current?.blur(), document.getElementById("cpl")?.click());
                }}
                className="flex h-fit w-full flex-row items-center rounded-md bg-(--accent-color)/10 px-2 py-1 pb-1.25 text-sm focus:outline-0"
              />
            </div>
            <button
              id="cpl"
              children="Add to new playlist"
              onClick={() => {
                if (!value) return;
                const [name, K] = [value, Date.now().toString()];
                setPlaylistData((_) => ({ ..._, [K]: Array.from(new Set([...(playlistData[K] || []), ...selections.map((_) => _.id)])) }));
                setPlaylistIndex((_) => [..._, { name, K }]);
                setInSelectionMode(false);
                setSelections([]);
                setShow(false);
                setValue("");
              }}
              className="flex h-full w-fit items-center rounded-md border-2 border-green-500/50 px-2 text-sm font-medium text-nowrap text-green-400 active:scale-95"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
});
