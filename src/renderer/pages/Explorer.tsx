/** @format */

import { chunk } from "../../shared/helpers";
import { MdRestartAlt } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import { LuFolderSearch } from "react-icons/lu";
import { Track } from "../components/utils/Track";
import { RiErrorWarningLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualList } from "../hooks/useVirtualList";
import { Directory } from "../components/utils/Directory";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DirectoryGrid } from "../components/utils/DirectoryGrid";
import { treeStore, searchBox, likedSongsStore, needsRestart } from "../utils/stores";

export function List() {
  const [tree] = treeStore.use();
  const [rs, setRs] = needsRestart.use();
  const [path, setPath] = useState([tree]);
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const current = useMemo(() => path[path.length - 1]!, [path]);
  const [dirs, setDirs] = useState(current.dirs.sort((a, b) => a.name.localeCompare(b.name)));
  const [files, setFiles] = useState(current.files.sort((a, b) => a.title.localeCompare(b.title)));

  const [direction, setDirection] = useState(1);
  const goForward: typeof setPath = (v) => (setDirection(1), setPath(v));
  const goBack = (newPath: typeof path) => (setDirection(-1), setPath(newPath));

  const rows = useMemo(
    () => [
      ...(dirs.length ? ([{ type: "label", label: "Directories", count: dirs.length }] as const) : []),
      ...(dirs.length ? chunk(dirs, 5).map((c, i, arr) => ({ type: "dir", dirs: c, index: i, len: arr.length }) as const) : []),
      ...(files.length ? [{ type: "label", label: "Playable tracks", count: files.length } as const] : []),
      ...(files.length ? files.map((f, i, arr) => ({ type: "file", file: f, index: i, len: arr.length }) as const) : []),
    ],
    [dirs, files],
  );

  useEffect(() => setQuery(""), []);
  useEffect(() => (setDirs(current.dirs), setFiles(current.files)), [current]);
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [current]);
  useEffect(() => {
    setDirs(!query ? current.dirs : current.dirs.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())));
    setFiles(!query ? current.files : current.files.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())));
  }, [query]);

  const make = useCallback(
    ({ index }: { index: number }) => {
      const row = rows[index]!;

      switch (row.type) {
        case "dir":
          return (
            <DirectoryGrid index={row.index} len={row.len}>
              {row.dirs.map((dir, i) => (
                <Directory dir={dir} key={dir.name} onClick={() => goForward([...path, row.dirs[i]!])} />
              ))}
            </DirectoryGrid>
          );

        case "file":
          return (
            <Track
              file={row.file}
              index={row.index}
              key={row.file.id}
              initial={row.index === 0}
              end={row.index === row.len - 1}
              isLiked={liked.includes(row.file.id)}
              onClick={() => console.log({ current: index, queue: current.files })}
              onLike={() =>
                setLiked((liked) => (liked.includes(row.file.id) ? liked.filter((e) => e !== row.file.id) : [...liked, row.file.id]))
              }
            />
          );

        case "label":
          return (
            <div
              key={row.label}
              className={`flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20 ${index === 0 ? "pb-6" : "py-6"}`}
            >
              <div className="font-medium">{row.label}</div>
              <div className="pr-3 text-xs text-(--accent-color) opacity-90">{row.count} items</div>
            </div>
          );
      }
    },
    [rows],
  );

  const [list, virtualizer] = useVirtualList({ scrollRef, Component: make, list: rows.map((_, i) => i), getItemKey: (index) => index });

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit items-center gap-3">
        <div className="flex flex-row gap-2">
          <button
            disabled={path.length === 1}
            onClick={() => goBack(path.slice(0, path.length - 1))}
            children={path.length === 1 ? <LuFolderSearch /> : <IoIosArrowBack />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
        </div>

        <div className="flex w-full flex-row gap-2">
          {path.map((dir, i) => (
            <span key={i} className="flex items-center gap-1 text-sm font-medium">
              <span className="cursor-pointer hover:underline" onClick={() => goBack(path.slice(0, i + 1))}>
                {dir.name.charAt(0).toUpperCase() + dir.name.slice(1)}
              </span>

              {i < path.length - 1 && <span className="ml-1">/</span>}
            </span>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
            initial={{ x: direction > 0 ? "20%" : "-20%", opacity: 0 }}
            style={{
              position: "relative",
              height: tree.dirs.length === 0 && tree.files.length === 0 ? "100%" : virtualizer.getTotalSize(),
            }}
          >
            {tree.dirs.length === 0 && tree.files.length === 0 ? (
              <div className="flex h-[95%] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-(--border-color)/20 py-5">
                <div className="flex flex-row items-center gap-2 text-xl font-medium">
                  <RiErrorWarningLine className="mt-0.5" />
                  <div>Media folder has no items to display</div>
                </div>
                <div className="pt-2 text-xs opacity-60">
                  Please add some tracks to your media folder. Or to change your media folder using the button below.
                </div>
                <div className="pb-2 text-[11px] opacity-60">You need to restart the app for the changes to take effect.</div>
                <div className="flex flex-row items-center gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    children={<MdRestartAlt className="mb-0.5" />}
                    className="flex aspect-square h-8 cursor-pointer flex-row items-center justify-center gap-1 rounded-full border-2 border-(--border-color)/15 bg-(--border-color)/10 p-1 text-xl transition-all duration-100 hover:scale-110 hover:bg-(--accent-color)/10 active:scale-95"
                  />

                  <button
                    children={"Change media folder"}
                    className="flex h-8 w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--border-color)/10 px-5 text-xs transition-all duration-100 hover:scale-102 hover:bg-(--accent-color)/10 active:scale-95"
                    onClick={async () => {
                      const newMediaFolder = await window.api.openFolderDialog();
                      if (!newMediaFolder || newMediaFolder === tree.path) return;
                      localStorage.setItem("mediaFolder", newMediaFolder);
                      await window.api.setMediaFolder(newMediaFolder);
                      !rs && setRs(true);
                    }}
                  />
                </div>
              </div>
            ) : virtualizer.getVirtualItems().length === 0 ? (
              <div className="flex h-fit w-full flex-row items-center justify-center gap-2 rounded-md border-2 border-(--border-color)/20 py-5 text-xl font-medium">
                <RiErrorWarningLine className="mt-0.5" />
                <div>No items to display</div>
              </div>
            ) : (
              list
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
