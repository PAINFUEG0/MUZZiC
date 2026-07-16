/** @format */

import { memo } from "react";
import { Tree } from "../../../shared/types";
import { TbFileMusicFilled } from "react-icons/tb";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";
import { BiAddToQueue, BiDotsVertical, BiTrash } from "react-icons/bi";

type Props = {
  end: boolean;
  index: number;
  initial: boolean;
  isLiked: boolean;
  onLike: () => void;
  onClick: () => void;
  file: Tree["files"][number];
};

export const Track = memo(({ end, file, index, initial, onClick, isLiked, onLike }: Props) => (
  <div
    className={
      `flex h-fit w-full flex-col border-(--border-color)/20 bg-(--hover-color)/5 px-5 backdrop-blur-md ` +
      `${
        initial && end
          ? "rounded-md border-2 pt-5 pb-5"
          : initial
            ? "rounded-md rounded-b-none border-2 border-b-0 pt-5 pb-0.75"
            : end
              ? "rounded-md rounded-t-none border-2 border-t-0 pt-0.75 pb-5"
              : "border-x-2 pt-0.75 pb-0.75"
      }`
    }
  >
    <div className="grid w-full shrink-0 cursor-pointer grid-cols-15 rounded-md px-2 py-1 transition-transform duration-50 hover:bg-(--hover-color)/20">
      <div className="flex h-full w-full flex-row items-center justify-between px-0.5">
        <div className="flex w-2.5 shrink-0 justify-end text-xs opacity-50">{index + 1}</div>
        <TbFileMusicFilled className="aspect-square h-8 w-8 shrink-0 text-(--accent-color)" />
      </div>

      <div className="group col-span-8 flex w-full flex-col px-3" onClick={onClick}>
        <div className="text-no-wrap min-w-0 truncate text-xs" children={file.title} />
        <div className="flex w-full flex-row gap-3 text-[10px] opacity-50">
          <div className="text-no-wrap min-w-0 truncate" children={file.artists?.join(", ")} />
          <div className="text-no-wrap min-w-0 truncate" children={"-"} />
          <div className="text-no-wrap min-w-0 truncate" children={file.album} />
        </div>
      </div>

      <div
        className="col-span-1 flex items-center justify-center transition-all duration-100 active:scale-70"
        children={isLiked ? <RiHeartFill className="text-(--accent-color)" /> : <RiHeartLine />}
        onClick={onLike}
      />

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
  </div>
));
