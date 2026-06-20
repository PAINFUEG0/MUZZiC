/** @format */

import { Tree } from "../../utils/globalStores";
import { TbFileMusicFilled } from "react-icons/tb";
import { Track } from "../../../shared/types/sourcePlugin";

export function Files({ current, onClick }: { current: Tree; onClick: (e: Track<true>) => void }) {
  return (
    <div className="flex h-fit w-full shrink-0 flex-col gap-3">
      <div className="flex h-fit w-full flex-row items-end justify-between border-white/20">
        <div className="font-medium">Playable tracks</div>
        <div className="pr-3 text-xs text-(--accent-color) opacity-90"> {current.files.length} items</div>
      </div>

      <div className="flex h-fit w-full flex-col gap-2 rounded-md border-2 border-white/20 bg-black/5 p-5 backdrop-blur-md">
        {current.files.slice(0, 50).map((e) => (
          <div key={e.id} onClick={onClick.bind(null, e)} className="flex h-fit w-full cursor-pointer flex-row gap-3">
            <TbFileMusicFilled className="h-8 w-8 text-(--accent-color)" />

            <div className="flex w-full flex-col">
              <div className="flex w-full flex-row items-center gap-2">
                <div className="text-no-wrap min-w-0 truncate text-xs font-bold" children={e.title} />
                <div
                  className="rounded-sm border px-0.5 py-px text-[10px] leading-2.5 font-bold"
                  style={{
                    color:
                      e.resolution === "DD" ? "#55ff55" : e.resolution === "CD" ? "#aa33cc" : e.resolution === "HR" ? "#aa9922" : "#2255dd",
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
  );
}
