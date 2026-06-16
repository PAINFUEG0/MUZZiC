/** @format */

import { useState } from "react";
import { LuFolder } from "react-icons/lu";
import { treeStore } from "../utils/Store";
import { RiHome2Line } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";

export function List() {
  const [data] = treeStore.use();
  const [src, setSrc] = useState("");
  const [path, setPath] = useState([data]);

  const current = path[path.length - 1]!;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex h-fit items-center gap-5 border-b p-5">
        <div className="flex flex-row gap-2">
          <button
            disabled={path.length === 1}
            onClick={() => setPath((path) => [...path.slice(0, path.length - 1)])}
            className="flex items-center justify-center rounded-full border-2 p-1 text-sm text-black"
          >
            <IoIosArrowBack />
          </button>
          <button
            onClick={() => setPath((path) => [...path.slice(0, 1)])}
            className="flex items-center justify-center rounded-full border-2 p-1 text-sm text-black"
          >
            <RiHome2Line />
          </button>

          <audio controls src={src} />
        </div>

        <div className="flex flex-row gap-2">
          {path.map((dir, i) => (
            <span key={i} className="flex items-center gap-1 text-sm font-bold">
              <span className="cursor-pointer hover:underline" onClick={() => setPath(path.slice(0, i + 1))}>
                {dir.name.charAt(0).toUpperCase() + dir.name.slice(1)}
              </span>

              {i < path.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-full w-full scrollbar-none flex-col gap-2 overflow-auto p-5">
        {current.dirs.map((dir, i) => (
          <div
            key={dir.name}
            onClick={() => setPath([...path, current.dirs[i]!])}
            className="flex h-fit w-full cursor-pointer flex-row items-center gap-1"
          >
            <LuFolder className="text-yellow-600" />
            <div className="text-xs font-medium" children={dir.name} />
            <div className="text-xs font-medium" children={`( ${dir.files.length + dir.dirs.length} items )`} />
          </div>
        ))}

        <div className="flex h-fit w-full flex-col gap-2">
          {current.files.slice(0, 50).map((e) => (
            <div key={e.id} className="flex h-fit w-full cursor-pointer flex-row gap-3" onClick={() => setSrc("file:///" + e.streamURI)}>
              <div className="h-8 w-8 overflow-hidden rounded-md">
                <img src={e.thumb} className="h-full w-full object-cover" />
              </div>

              <div className="flex w-full flex-col">
                <div className="flex w-full flex-row items-center gap-2">
                  <div className="text-no-wrap min-w-0 truncate text-xs font-bold" children={e.title} />
                  <div
                    className="rounded-sm border px-0.5 py-px text-[10px] leading-2.5 font-bold"
                    style={{
                      color:
                        e.resolution === "DD"
                          ? "#55ff55"
                          : e.resolution === "CD"
                            ? "#aa33cc"
                            : e.resolution === "HR"
                              ? "#aa9922"
                              : "#2255dd",
                    }}
                    children={e.resolution}
                  />
                </div>

                <div className="flex w-full flex-row gap-3 text-xs opacity-70">
                  <div className="text-no-wrap min-w-0 truncate" children={e.artists.map((a) => a.name).join(", ")} />
                  <div className="text-no-wrap min-w-0 truncate" children={"-"} />
                  <div className="text-no-wrap min-w-0 truncate" children={e.album.name} />
                </div>
              </div>

              <div className="text-no-wrap col-span-1 min-w-0 shrink-0 truncate text-xs font-medium">
                {`${Math.floor(e.duration / 60)}`.padStart(2, "0")}:{`${Math.floor(e.duration % 60)}`.padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
