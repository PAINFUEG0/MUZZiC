/** @format */

import { chunk } from "../../shared/helpers";
import { IoIosArrowBack } from "react-icons/io";
import { LuFolderSearch } from "react-icons/lu";
import { Track } from "../components/utils/Track";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Directory } from "../components/utils/Directory";
import { DirectoryGrid } from "../components/utils/DirectoryGrid";
import { treeStore, searchBox, likedSongsStore } from "../utils/globalStores";

export function List() {
  const [data] = treeStore.use();
  const [path, setPath] = useState([data]);
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = likedSongsStore.use();

  const current = path[path.length - 1]!;
  const [dirs, setDirs] = useState(current.dirs);
  const [files, setFiles] = useState(current.files);

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

  const [direction, setDirection] = useState(1);
  const goForward: typeof setPath = (v) => (setDirection(1), setPath(v));
  const goBack = (newPath: typeof path) => (setDirection(-1), setPath(newPath));

  const rows = [
    ...(dirs.length ? ([{ type: "label", label: "Directories", count: dirs.length }] as const) : []),
    ...(dirs.length ? chunk(dirs, 5).map((c, i, arr) => ({ type: "dir", dirs: c, index: i, len: arr.length }) as const) : []),
    ...(files.length ? [{ type: "label", label: "Playable tracks", count: files.length } as const] : []),
    ...(files.length ? files.map((f, i, arr) => ({ type: "file", file: f, index: i, len: arr.length }) as const) : []),
  ];

  const virtualizer = useVirtualizer({
    overscan: 5,
    count: rows.length,
    estimateSize: () => 61,
    getScrollElement: () => scrollRef.current,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  useEffect(() => setQuery(""), []);
  useEffect(() => (setDirs(current.dirs), setFiles(current.files)), [current]);
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [current]);
  useEffect(() => {
    setDirs(!query ? current.dirs : current.dirs.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())));
    setFiles(!query ? current.files : current.files.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())));
  }, [query]);

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

      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          el && setAtTop(el.scrollTop <= 0);
          el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
        }}
        style={{ maskImage, WebkitMaskImage: maskImage, willChange: "scroll-position" }}
        className="relative inset-0 flex h-full w-full scrollbar-none flex-col overflow-auto overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
            initial={{ x: direction > 0 ? "20%" : "-20%", opacity: 0 }}
            style={{ height: virtualizer.getTotalSize(), position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((vItem) => {
              const row = rows[vItem.index]!;

              return (
                <div
                  key={vItem.index}
                  data-index={vItem.index}
                  ref={virtualizer.measureElement}
                  style={{ top: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px) ` }}
                  children={
                    row.type === "label" ? (
                      <div
                        key={row.label}
                        className={`flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20 ${vItem.index === 0 ? "pb-6" : "py-6"}`}
                      >
                        <div className="font-medium">{row.label}</div>
                        <div className="pr-3 text-xs text-(--accent-color) opacity-90">{row.count} items</div>
                      </div>
                    ) : row.type === "dir" ? (
                      <DirectoryGrid index={row.index} len={row.len}>
                        {row.dirs.map((dir, i) => (
                          <Directory dir={dir} key={dir.name} onClick={() => goForward([...path, row.dirs[i]!])} />
                        ))}
                      </DirectoryGrid>
                    ) : (
                      <Track
                        file={row.file}
                        index={row.index}
                        key={row.file.id}
                        initial={row.index === 0}
                        end={row.index === row.len - 1}
                        isLiked={liked.includes(row.file.id)}
                        onClick={() => console.log({ current: vItem.index, queue: current.files })}
                        onLike={() =>
                          setLiked((liked) =>
                            liked.includes(row.file.id) ? liked.filter((e) => e !== row.file.id) : [...liked, row.file.id],
                          )
                        }
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
