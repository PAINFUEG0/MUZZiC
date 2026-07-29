/** @format */

import { memo } from "react";
import { Tree } from "../../../shared/types";
import { RiFolderMusicFill } from "react-icons/ri";

export const Directory = memo(({ dir, onClick }: { dir: Tree["dirs"][number]; onClick: () => void }) => (
  <div onClick={onClick} className="flex h-fit w-full cursor-pointer flex-row items-center gap-1 rounded-md px-2 py-1 hover:bg-(--hover-color)/20">
    <RiFolderMusicFill className="h-8.5 w-8.5 shrink-0 text-(--accent-color)" />

    <div className="flex h-fit w-full flex-col">
      <div className="text-no-wrap min-w-0 truncate text-[11px] font-medium" children={dir.name} />
      <div className="text-no-wrap min-w-0 truncate text-[8.5px] opacity-70" children={`${dir.files.length} files ${dir.dirs.length ? `& ${dir.dirs.length} dirs` : ""}`} />
    </div>
  </div>
));
