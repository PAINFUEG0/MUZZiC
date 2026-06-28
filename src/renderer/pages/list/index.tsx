/** @format */

import { File } from "./Files";
import { motion } from "framer-motion";
import { Directory } from "./Directories";
import { chunk } from "../../../shared/helpers";
import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { searchBox, treeStore } from "../../utils/globalStores";
import { IoIosArrowBack, IoIosMusicalNotes } from "react-icons/io";

const variants = {
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-20%" : "20%", opacity: 0 }),
  enter: (dir: number) => ({ x: dir > 0 ? "20%" : "-20%", opacity: 0 }),
};

export function List() {
  const [data] = treeStore.use();
  const [path, setPath] = useState([data]);
  const [atTop, setAtTop] = useState(true);
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  const current = path[path.length - 1]!;
  const [dirs, setDirs] = useState(current.dirs);
  const [files, setFiles] = useState(current.files);

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
    <div className="flex h-full w-full flex-col gap-8 overflow-hidden p-10 pb-5">
      <div className="flex h-fit items-center gap-3">
        <div className="flex flex-row gap-2">
          <button
            onClick={() => goBack(path.slice(0, path.length - 1))}
            children={path.length === 1 ? <IoIosMusicalNotes /> : <IoIosArrowBack />}
            disabled={path.length === 1}
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

      <motion.div
        exit="exit"
        initial="enter"
        ref={scrollRef}
        animate="center"
        key={current.name}
        custom={direction}
        variants={variants}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{ maskImage, WebkitMaskImage: maskImage, willChange: "scroll-position" }}
        onScroll={() => {
          const el = scrollRef.current;
          el && setAtTop(el.scrollTop <= 0);
          el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
        }}
        className="relative inset-0 flex h-full w-full scrollbar-none flex-col overflow-auto overflow-y-auto"
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const row = rows[vItem.index]!;

            const component =
              row.type === "label" ? (
                <div key={row.label} className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20 py-6">
                  <div className="font-medium">{row.label}</div>
                  <div className="pr-3 text-xs text-(--accent-color) opacity-90">{row.count} items</div>
                </div>
              ) : row.type === "dir" ? (
                <div
                  key={"dirs"}
                  className={
                    `grid grid-cols-5 gap-x-3 border-(--border-color)/20 bg-(--hover-color)/5 px-5 backdrop-blur-md ` +
                    `${
                      row.len === 1
                        ? "rounded-md border-2 pt-5 pb-5"
                        : row.index === 0
                          ? "rounded-md rounded-b-none border-2 border-b-0 pt-5 pb-0.75"
                          : row.index === row.len - 1
                            ? "rounded-md rounded-t-none border-2 border-t-0 pt-0.75 pb-5"
                            : "border-x-2 pt-0.75 pb-0.75"
                    } `
                  }
                >
                  {row.dirs.map((dir, i) => (
                    <Directory key={dir.name} dir={dir} onClick={() => goForward([...path, dirs[i]!])} />
                  ))}
                </div>
              ) : (
                <File
                  file={row.file}
                  index={row.index}
                  key={row.file.id}
                  initial={row.index === 0}
                  end={row.index === row.len - 1}
                  onClick={(e) => console.log(e.path)}
                />
              );

            return (
              <div
                key={vItem.index}
                children={component}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                style={{ top: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px) ` }}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
