/** @format */

import { LuHeart } from "react-icons/lu";
import { Tree } from "../../utils/globalStores";
import { TbFileMusicFilled } from "react-icons/tb";
import { Track } from "../../../shared/types";
import { BiAddToQueue, BiDotsVertical, BiTrash } from "react-icons/bi";

export function File({ file, index, onClick }: { file: Tree["files"][number]; index: number; onClick: (e: Track) => void }) {
  return (
    <div
      onClick={onClick.bind(null, file)}
      className="grid w-full shrink-0 cursor-pointer grid-cols-15 rounded-md px-2 py-1 transition-transform duration-100 hover:bg-(--hover-color)/20 active:scale-[99%]"
    >
      <div className="flex h-full w-full flex-row items-center justify-between px-0.5">
        <div className="flex w-2.5 shrink-0 justify-end text-xs opacity-50">{index + 1}</div>
        <TbFileMusicFilled className="aspect-square h-8 w-8 shrink-0 text-(--accent-color)" />
      </div>

      <div className="col-span-8 flex w-full flex-col px-3">
        <div className="text-no-wrap min-w-0 truncate text-xs" children={file.title} />
        <div className="flex w-full flex-row gap-3 text-[10px] opacity-50">
          <div className="text-no-wrap min-w-0 truncate" children={file.artists?.join(", ")} />
          <div className="text-no-wrap min-w-0 truncate" children={"-"} />
          <div className="text-no-wrap min-w-0 truncate" children={file.album} />
        </div>
      </div>

      <div className="col-span-1 flex items-center justify-center" children={<LuHeart />} />

      <div
        children={
          file.resolution.name === "SR"
            ? `${Math.round(file.resolution.bitrate / 1000)} kb/s`
            : file.resolution.name === "DD"
              ? `EAC3 - ${Math.round(file.resolution.bitrate / 1000)} kb/s`
              : `${file.resolution.bitDepth} bit - ${file.resolution.sampleRate / 1000} kHz`
        }
        className="text-no-wrap col-span-2 flex min-w-0 shrink-0 items-center justify-center truncate text-xs font-medium opacity-100"
      />

      <div className="text-no-wrap col-span-1 flex min-w-0 shrink-0 items-center justify-center truncate text-xs">
        {`${Math.floor(file.duration / 60)}`.padStart(2, "0")}:{`${Math.floor(file.duration % 60)}`.padStart(2, "0")}
      </div>

      <div className="col-span-2 flex flex-row items-center justify-between px-3 opacity-90">
        <BiAddToQueue className="shrink-0" />
        <BiTrash className="shrink-0" />
        <BiDotsVertical className="shrink-0" />
      </div>
    </div>
  );
}
