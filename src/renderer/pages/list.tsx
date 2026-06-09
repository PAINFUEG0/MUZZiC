import { treeStore } from "../utils/Store";
import { useEffect, useState } from "react";
import { RiHome2Line } from "react-icons/ri";
import { flatten } from "../../shared/helpers";
import { IoIosArrowBack } from "react-icons/io";
import { LuFile, LuFolder } from "react-icons/lu";
import { DirNode, File } from "../../shared/types/utils.js";
import { Track } from "../../shared/types/sourcePlugin.js";

export function List() {
  const [data, setData] = treeStore.use();
  const [path, setPath] = useState([data]);
  const [ready, setReady] = useState(false);

  const current = path[path.length - 1]!;

  useEffect(() => {
    (async () => {
      const flat = flatten(data);
      const metas = Object.fromEntries((await window.api.getMeta(flat.map((e) => e.id))).filter(Boolean).map((e) => [e!.id, e]));

      const populate = (node: DirNode<true>) => {
        for (let i = 0; i < node.files.length; i++) (node.files[i] as any) = { ...node.files[i], ...(metas[node.files[i]!.id] || {}) };
        node.dirs.forEach((e) => populate(e));
      };

      populate(data);
      console.log(data);

      setData({ ...data });
      setReady(true);
    })();
  }, []);

  if (!ready) return <div className="flex h-full w-full items-center justify-center">Loading...</div>;

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

        {current.files.map((e: Track<true> | File<true>) => (
          <div key={e.id} className="flex h-fit w-full flex-row items-center gap-1">
            <LuFile />
            <div className="text-xs font-medium" children={"title" in e ? e.title : e.name} />
            -
            <div className="text-xs font-medium" children={"resolution" in e ? e.resolution : "Unknown Resolution"} />
            -
            <div className="text-xs font-medium" children={"duration" in e ? e.duration : "Unknown duration"} />
            -
            <div
              className="text-xs font-medium"
              children={"artists" in e && Array.isArray(e.artists) ? e.artists.map((a) => a.name).join(", ") : "Unknown Artists"}
            />
            -
            <div className="text-xs font-medium" children={"album" in e ? e.album.name : "Unknown Album"} />
          </div>
        ))}
      </div>
    </div>
  );
}
