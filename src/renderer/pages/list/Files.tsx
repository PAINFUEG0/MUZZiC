/** @format */

import { Tree } from "../../utils/globalStores";
import { TbFileMusicFilled } from "react-icons/tb";
import { Track } from "../../../shared/types/sourcePlugin";
import { BiAddToQueue, BiDotsVertical, BiTrash } from "react-icons/bi";

export function Files({ files, onClick }: { files: Tree["files"]; onClick: (e: Track) => void }) {
  return (
    <div className="flex h-fit w-full shrink-0 flex-col gap-3">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="font-medium">Playable tracks</div>
        <div className="pr-3 text-xs text-(--accent-color) opacity-90"> {files.length} items</div>
      </div>

      <div className="flex h-fit w-full flex-col gap-1 rounded-md border-2 border-(--border-color)/20 bg-(--hover-color)/5 p-5 backdrop-blur-md">
        {files.map((e) => (
          <div key={e.id} className="grid w-full shrink-0 grid-cols-15 px-2 py-0.75" onClick={onClick.bind(null, e)}>
            <TbFileMusicFilled className="aspect-square h-8 w-8 shrink-0 text-(--accent-color)" />

            <div className="col-span-8 flex w-full flex-col">
              <div className="text-no-wrap min-w-0 truncate text-xs font-bold" children={e.title} />
              <div className="flex w-full flex-row gap-3 text-xs opacity-70">
                <div className="text-no-wrap min-w-0 truncate" children={e.artists?.join(", ")} />
                <div className="text-no-wrap min-w-0 truncate" children={"-"} />
                <div className="text-no-wrap min-w-0 truncate" children={e.album} />
              </div>
            </div>

            <div
              children={
                e.resolution.name === "SR"
                  ? `${Math.round(e.resolution.bitrate / 1000)} kb/s`
                  : e.resolution.name === "DD"
                    ? `EAC3 - ${Math.round(e.resolution.bitrate / 1000)} kb/s`
                    : `${e.resolution.bitDepth} bit - ${e.resolution.sampleRate / 1000} kHz`
              }
              className="text-no-wrap col-span-2 flex min-w-0 shrink-0 items-center justify-center truncate text-xs opacity-50"
            />

            <div className="text-no-wrap col-span-1 flex min-w-0 shrink-0 items-center justify-center truncate text-xs">
              {`${Math.floor(e.duration / 60)}`.padStart(2, "0")}:{`${Math.floor(e.duration % 60)}`.padStart(2, "0")}
            </div>

            <div className="col-span-3 flex flex-row items-center justify-center gap-7 px-3 opacity-90">
              <BiAddToQueue />
              <BiTrash />
              <BiDotsVertical />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
