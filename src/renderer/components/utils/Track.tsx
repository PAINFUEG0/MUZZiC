/** @format */

import { memo, ReactNode } from "react";
import { Tree } from "../../../shared/types";
import { LuDisc, LuDisc3 } from "react-icons/lu";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";
import { selected, selectMode } from "../../stores";

type Props = {
  end: boolean;
  index: number;
  initial: boolean;
  isLiked: boolean;
  onLike: () => void;
  button1: ReactNode;
  button2: ReactNode;
  button3: ReactNode;
  onClick: () => void;
  file: Tree["files"][number];
  isCurrentlyPlaying?: boolean;
};

export const Track = memo(({ end, file, index, initial, onClick, isLiked, onLike, button1, button2, button3, isCurrentlyPlaying }: Props) => {
  const [selections, setSelctions] = selected.use();
  const [inSelectionMode, setInSelectionMode] = selectMode.use();

  return (
    <div
      className={
        `flex h-fit w-full flex-col border-(--border-color)/20 bg-(--hover-color)/5 px-5 ` +
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
      <div className="grid w-full shrink-0 grid-cols-15 rounded-md px-2 py-1 transition-transform duration-50 hover:bg-(--hover-color)/20">
        <div className="relative flex h-full w-full flex-row items-center justify-between px-0.5">
          {inSelectionMode ? (
            <div
              onClick={() => setSelctions((_) => (_.includes(file.id) ? _.filter((e) => e !== file.id) : [..._, file.id]))}
              className={
                (selections.includes(file.id) ? "bg-(--accent-color)" : "") +
                " hover:bg(--accent-color) z-10 flex h-4 w-4 shrink-0 cursor-pointer justify-end rounded-sm border-2 border-(--border-color)/20 text-xs"
              }
            />
          ) : (
            <div
              children={index + 1}
              className="z-10 flex w-4 shrink-0 cursor-pointer justify-center text-xs opacity-50"
              onClick={() => (setInSelectionMode((_) => true), setSelctions((_) => [..._, file.id]))}
            />
          )}

          <div
            className="cursor-pointer text-(--accent-color)"
            children={isCurrentlyPlaying ? <LuDisc3 className="aspect-square h-8 w-8 shrink-0 animate-spin" /> : <LuDisc className="aspect-square h-8 w-8 shrink-0" />}
          />
        </div>

        <div className="group col-span-8 flex w-full cursor-pointer flex-col px-3" onClick={onClick}>
          <div className="text-no-wrap min-w-0 truncate text-xs" children={file.title} />
          <div className="flex w-full flex-row gap-3 text-[10px] opacity-50">
            <div className="text-no-wrap min-w-0 truncate" children={file.artists?.join(", ")} />
            <div className="text-no-wrap min-w-0 truncate" children={"-"} />
            <div className="text-no-wrap min-w-0 truncate" children={file.album} />
          </div>
        </div>

        <div
          className="col-span-1 flex cursor-pointer items-center justify-center transition-all duration-100 active:scale-70"
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

        <div className="col-span-2 flex pr-1 pl-5">
          <div className="flex h-full w-full flex-row items-center justify-between opacity-90">
            {button1}
            {button2}
            {button3}
          </div>
        </div>
      </div>
    </div>
  );
});
