import { useState } from "react";
import { LuFolder } from "react-icons/lu";
import { treeStore } from "../utils/Store";
import { RiHome2Line } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";

export function List() {
  const [data] = treeStore.use();
  const [path, setPath] = useState([data]);

  const current = path[path.length - 1]!;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-fit items-center gap-5 p-5 border-b">
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
        </div>

        <div className="flex flex-row gap-2">
          {path.map((dir, i) => (
            <span key={i} className="flex items-center gap-1  font-bold text-sm">
              <span className="cursor-pointer hover:underline" onClick={() => setPath(path.slice(0, i + 1))}>
                {dir.name.charAt(0).toUpperCase() + dir.name.slice(1)}
              </span>

              {i < path.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-full w-full flex-col gap-2 overflow-auto p-5">
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

        <div className="flex flex-col h-fit w-full gap-2">
          {current.files.map((e) => (
            <div key={e.id} className="flex flex-row h-fit w-full gap-3">
              <div className="h-8 w-8 rounded-md overflow-hidden">
                <img src={e.thumb} className="h-full w-full  object-cover" />
              </div>

              <div className="flex flex-col w-full">
                <div className="flex flex-row w-full gap-2 items-center">
                  <div className="text-xs font-bold text-no-wrap min-w-0 truncate" children={e.title} />
                  <div
                    className="px-0.5 py-px leading-2.5 border rounded-sm text-[10px] font-bold"
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

                <div className="opacity-70 gap-3 flex flex-row w-full text-xs">
                  <div className="text-no-wrap min-w-0 truncate" children={e.artists.map((a) => a.name).join(", ")} />
                  <div className="text-no-wrap min-w-0 truncate" children={"-"} />
                  <div className="text-no-wrap min-w-0 truncate" children={e.album.name} />
                </div>
              </div>

              <div className="col-span-1 text-xs font-medium text-no-wrap min-w-0 truncate shrink-0">
                {`${Math.floor(e.duration / 60)}`.padStart(2, "0")}:{`${Math.floor(e.duration % 60)}`.padEnd(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
