import { treeStore } from "../utils/Store";
import { useState } from "react";
import { RiHome2Line } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";
import { LuFolder } from "react-icons/lu";

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

        {current.files.map((e) => (
          <div key={e.id} className="grid grid-cols-6 h-fit w-full gap-1">
            <img src={e.thumb} className="h-8 w-8 object-cover" />
            <div className="text-xs font-medium" children={e.title} />
            <div className="text-xs font-medium" children={e.resolution} />
            <div className="text-xs font-medium" children={e.duration} />
            <div className="text-xs font-medium" children={e.artists.map((a) => a.name).join(", ")} />
            <div className="text-xs font-medium" children={e.album.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
