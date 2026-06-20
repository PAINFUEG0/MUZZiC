/** @format */

import { Files } from "./Files";
import { Directories } from "./Directories";
import { RiHome2Line } from "react-icons/ri";
import { treeStore } from "../../utils/globalStores";
import { IoIosArrowBack } from "react-icons/io";
import { useEffect, useRef, useState } from "react";

export function List() {
  const [data] = treeStore.use();
  const [src, setSrc] = useState("");
  const [path, setPath] = useState([data]);

  const current = path[path.length - 1]!;

  const audioref = useRef<HTMLAudioElement>(null);
  useEffect(() => void audioref.current?.play(), [src]);

  const [atTop, setAtTop] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtTop(el.scrollTop <= 0);
    setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const maskImage =
    atTop && atBottom
      ? "none"
      : atTop
        ? "linear-gradient(to bottom, black 95%, transparent 100%)"
        : atBottom
          ? "linear-gradient(to bottom, transparent 0%, black 5%)"
          : "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)";

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-hidden p-10 pb-5">
      <audio src={src} ref={audioref} />

      <div className="flex h-fit items-center gap-5">
        <div className="flex flex-row gap-2">
          {[
            { Icon: <IoIosArrowBack />, onclick: () => setPath((path) => [...path.slice(0, path.length - 1)]) },
            { Icon: <RiHome2Line />, onclick: () => setPath((path) => [...path.slice(0, 1)]) },
          ].map((b) => (
            <button
              children={b.Icon}
              onClick={b.onclick}
              disabled={path.length === 1}
              className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
            />
          ))}
        </div>

        <div className="flex flex-row gap-2">
          {path.map((dir, i) => (
            <span key={i} className="flex items-center gap-1 text-sm font-medium">
              <span className="cursor-pointer hover:underline" onClick={() => setPath(path.slice(0, i + 1))}>
                {dir.name.charAt(0).toUpperCase() + dir.name.slice(1)}
              </span>

              {i < path.length - 1 && <span className="ml-1">/</span>}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ maskImage, WebkitMaskImage: maskImage }}
        className="relative flex h-full w-full scrollbar-none flex-col gap-8 overflow-auto pb-4"
      >
        {current.dirs.length ? <Directories current={current} path={path} setPath={setPath} /> : null}

        {current.files.length ? (
          <Files
            current={current}
            onClick={(e) => setSrc("file:///" + encodeURIComponent((e as any).path.replace(/\\/g, "/")).replace(/%2F/g, "/"))}
          />
        ) : null}
      </div>
    </div>
  );
}
