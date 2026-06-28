/** @format */

import { File } from "./list/Files";
import { IoIosArrowBack } from "react-icons/io";
import { RiFolderMusicFill } from "react-icons/ri";
import { chunk, flatten } from "../../shared/helpers";
import { useVirtualizer } from "@tanstack/react-virtual";
import { searchBox, treeStore } from "../utils/globalStores";
import { useState, useRef, useEffect, ReactNode } from "react";

export function Artists() {
  const [data] = treeStore.use();
  const [atTop, setAtTop] = useState(true);
  const [query, setQuery] = searchBox.use();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  const maskImage =
    atTop && atBottom
      ? "none"
      : atTop
        ? "linear-gradient(to bottom, black 95%, transparent 100%)"
        : atBottom
          ? "linear-gradient(to bottom, transparent 0%, black 5%)"
          : "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)";

  const flat = flatten(data);
  const [selected, setSelected] = useState<string | null>(null);
  const albums = { ...Object.groupBy(flat, (e) => e.artists[0]!), ...Object.groupBy(flat, (e) => e.artists.join(", ")) };

  const [rows, setRows] = useState<
    { type: "tracks"; data: NonNullable<(typeof albums)[keyof typeof albums]> } | { type: "albums"; data: string[][] }
  >({ type: "albums", data: chunk(Object.keys(albums), 6) });

  const virtualizer = useVirtualizer({
    overscan: 5,
    estimateSize: () => 50,
    count: rows.data.length,
    getScrollElement: () => scrollRef.current,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  useEffect(() => setQuery(""), [selected]);

  useEffect(
    () =>
      void setRows(() => {
        if (!query) return selected ? { type: "tracks", data: albums[selected]! } : { type: "albums", data: chunk(Object.keys(albums), 6) };
        if (selected) return { type: "tracks", data: albums[selected]!.filter((e) => e.title.toLowerCase().includes(query.toLowerCase())) };
        const keys = Object.keys(albums).filter((e) => e.toLowerCase().includes(query.toLowerCase()));
        return { type: "albums", data: chunk(keys, 6) };
      }),
    [query],
  );
  useEffect(() => scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }), [rows]);

  useEffect(
    () => setRows(selected ? { type: "tracks", data: albums[selected]! } : { type: "albums", data: chunk(Object.keys(albums), 6) }),
    [selected],
  );

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5 ease-in-out">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            onClick={() => setSelected("")}
            children={!selected ? <RiFolderMusicFill /> : <IoIosArrowBack />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="flex flex-row items-center gap-1.5 font-medium">
            <div className="cursor-pointer hover:underline" onClick={() => setSelected("")} children="Artists" />
            {selected && <div className="shrink-0" children="/" />}
            {selected && <div className="min-w-0 truncate" children={selected} />}
          </div>
        </div>

        <div className="shrink-0 pr-3 text-xs text-(--accent-color) opacity-90">{rows.data.flat().length} items</div>
      </div>

      <div
        ref={scrollRef}
        style={{ maskImage, WebkitMaskImage: maskImage, willChange: "scroll-position" }}
        onScroll={() => {
          const el = scrollRef.current;
          el && setAtTop(el.scrollTop <= 0);
          el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
        }}
        className="flex h-full w-full scrollbar-none flex-col overflow-y-auto"
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const Parent = ({ c }: { c: ReactNode }) => (
              <div
                children={c}
                key={vItem.index}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                style={{ top: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px)` }}
              />
            );

            let children: ReactNode;

            if (selected && rows.type === "tracks") {
              const item = rows.data[vItem.index]!;
              children = (
                <File
                  file={item}
                  key={item.id}
                  index={vItem.index}
                  initial={vItem.index === 0}
                  end={vItem.index === rows.data.length - 1}
                  onClick={() => console.log(item.path)}
                />
              );
            }

            if (!selected && rows.type === "albums")
              children = (
                <div
                  className={
                    `grid grid-cols-6 gap-x-5 border-(--border-color)/20 bg-(--hover-color)/5 px-5 backdrop-blur-md ` +
                    `${
                      rows.data.length === 1
                        ? "rounded-md border-2 pt-5 pb-5"
                        : vItem.index === 0
                          ? "rounded-md rounded-b-none border-2 border-b-0 pt-5"
                          : vItem.index === rows.data.length - 1
                            ? "rounded-md rounded-t-none border-2 border-t-0 pt-5 pb-5"
                            : "border-x-2 pt-5"
                    } `
                  }
                >
                  {rows.data[vItem.index]!.map((artist) => (
                    <div
                      onClick={() => setSelected(artist)}
                      className="relative flex aspect-square h-full w-full cursor-pointer flex-col overflow-hidden rounded-md border-2 border-(--border-color)/20 active:scale-99"
                    >
                      <img src={albums[artist]![0]!.thumb} className="absolute inset-0 -z-10 h-full w-full object-cover" />

                      <div className="flex h-full w-full flex-col items-end justify-end">
                        <div className="flex h-12 w-full flex-col items-center gap-0.5 bg-(--hover-color)/50 p-2 backdrop-blur-sm">
                          <div className="w-full min-w-0 flex-row truncate text-center text-[11px] font-bold">{artist}</div>
                          <div className="w-full min-w-0 flex-row truncate text-center text-[10px] opacity-50">
                            {albums[artist]?.length} track/s
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );

            return <Parent c={children} />;
          })}
        </div>
      </div>
    </div>
  );
}
