/** @format */

import { Sleep } from "./Sleep";
import { Volume } from "./Volume";
import { memo, useState } from "react";
import { SiDolby } from "react-icons/si";
import { LuSlidersVertical } from "react-icons/lu";
import { TbBrandDolbyDigital } from "react-icons/tb";
import { playerEffects, playerState } from "../../player";
import { likedSongsStore, sleepTimer } from "../../utils/stores";
import { RiHeartFill, RiHeartLine, RiLoopRightFill, RiLoopRightAiLine, RiMoonFill } from "react-icons/ri";

type T = ReturnType<(typeof playerState)["use"]>;

export const FXControls = memo(({ id, repeatMode, setState }: { id: string | null; repeatMode?: any; setState: T[1] }) => {
  const [open, setOpen] = useState(false);
  const [fx, setFx] = playerEffects.use();
  const [liked, setLiked] = likedSongsStore.use();
  const [sleepTime, setSleepTime] = sleepTimer.use();

  return (
    <div className="flex h-full w-full flex-row items-center justify-end gap-10 px-7">
      <div className="flex h-full w-fit flex-row items-center gap-5 pl-5">
        <div
          onClick={() => setFx((s) => ({ ...s, crossfeed: !s.crossfeed }))}
          children={fx.crossfeed ? <SiDolby className="m-0.5" /> : <TbBrandDolbyDigital />}
          className={"cursor-pointer active:scale-85 " + (fx.crossfeed ? " text-(--accent-color)" : "hover:text-(--accent-color)")}
        />

        <div
          children={id && liked.includes(id) ? <RiHeartFill /> : <RiHeartLine />}
          onClick={() => id && setLiked((liked) => (liked.includes(id) ? liked.filter((e) => e !== id) : [...liked, id]))}
          className={"cursor-pointer active:scale-85 " + (liked.includes(id!) ? " text-(--accent-color)" : "hover:text-(--accent-color)")}
        />

        <div
          onClick={() => setState((_) => ({ ..._, loop: !_.loop }))}
          children={repeatMode ? <RiLoopRightAiLine /> : <RiLoopRightFill />}
          className={"cursor-pointer active:scale-85 " + (repeatMode ? " text-(--accent-color)" : "hover:text-(--accent-color)")}
        />

        <RiMoonFill
          onClick={() => setOpen(true)}
          className={"cursor-pointer hover:text-(--accent-color) active:scale-85 " + (sleepTime ? "text-(--accent-color)" : "")}
        />

        <LuSlidersVertical className="cursor-pointer hover:text-(--accent-color) active:scale-85" onClick={() => {}} />
      </div>

      <Volume FX={fx} setFX={setFx} />

      <Sleep show={open} setShow={setOpen} sleepTime={sleepTime} setSleepTime={setSleepTime} />
    </div>
  );
});
