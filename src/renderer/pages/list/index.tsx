/** @format */

import { Files } from "./Files";
import { Directories } from "./Directories";
import { RiHome2Line } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { searchBox, treeStore } from "../../utils/globalStores";

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

  useEffect(() => setQuery(""), []);
  useEffect(() => (setDirs(current.dirs), setFiles(current.files)), [current]);
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [current]);

  useEffect(() => {
    setDirs(!query ? current.dirs : current.dirs.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())));
    setFiles(!query ? current.files : current.files.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())));
  }, [query]);

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

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-hidden p-10 pb-5">
      <div className="flex h-fit items-center gap-5">
        <div className="flex flex-row gap-2">
          {[
            { Icon: <IoIosArrowBack />, onclick: () => goBack(path.slice(0, path.length - 1)) },
            { Icon: <RiHome2Line />, onclick: () => goBack(path.slice(0, 1)) },
          ].map((b) => (
            <button
              children={b.Icon}
              onClick={b.onclick}
              disabled={path.length === 1}
              className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
            />
          ))}
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

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            exit="exit"
            initial="enter"
            ref={scrollRef}
            animate="center"
            key={current.name}
            custom={direction}
            variants={variants}
            style={{ maskImage, WebkitMaskImage: maskImage }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onScroll={() => {
              const el = scrollRef.current;
              el && setAtTop(el.scrollTop <= 0);
              el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
            }}
            className="absolute inset-0 flex scrollbar-none flex-col gap-8 overflow-auto pb-4"
          >
            {dirs.length ? <Directories dirs={dirs} path={path} setPath={goForward} /> : null}
            {files.length ? (
              <Files
                files={files}
                onClick={(e) => console.log("file:///" + encodeURIComponent((e as any).path.replace(/\\/g, "/")).replace(/%2F/g, "/"))}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
