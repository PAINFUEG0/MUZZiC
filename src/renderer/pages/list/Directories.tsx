/** @format */

import { Tree } from "../../utils/globalStores";
import { RiFolderMusicFill } from "react-icons/ri";

export function Directories({ current, path, setPath }: { current: Tree; path: Tree[]; setPath: (path: Tree[]) => void }) {
  return (
    <div className="flex h-fit w-full shrink-0 flex-col gap-3">
      <div className="flex h-fit w-full flex-row items-end justify-between border-white/20">
        <div className="font-medium">Directories</div>
        <div className="pr-3 text-xs text-(--accent-color) opacity-90">{current.dirs.length} items</div>
      </div>

      <div className="grid grid-cols-5 gap-x-3 gap-y-1 rounded-md border-2 border-white/20 bg-black/5 p-5 backdrop-blur-md">
        {current.dirs.map((dir, i) => (
          <div
            key={dir.name}
            onClick={() => setPath([...path, current.dirs[i]!])}
            className="flex h-fit w-full cursor-pointer flex-row items-center gap-1 rounded-md px-2 py-1 hover:bg-black/20"
          >
            <RiFolderMusicFill className="h-8.5 w-8.5 text-(--accent-color)" />

            <div className="flex h-fit w-full flex-col">
              <div className="text-no-wrap min-w-0 truncate text-[11px] font-medium" children={dir.name} />
              <div
                className="text-no-wrap min-w-0 truncate text-[8.5px] opacity-70"
                children={`${dir.files.length} files ${dir.dirs.length ? `& ${dir.dirs.length} dirs` : ""}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
