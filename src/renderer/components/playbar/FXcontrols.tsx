/** @format */

import { Sleep } from "./Sleep";
import { Volume } from "./Volume";
import { memo, useState } from "react";
import { playerEffects, playerState } from "../../player";
import { LuRotate3D, LuSlidersVertical } from "react-icons/lu";
import { likedSongsStore, sceneStore, sleepTimer } from "../../stores";
import { RiHeartFill, RiHeartLine, RiLoopRightFill, RiLoopRightAiLine, RiMoonFill } from "react-icons/ri";

type T = ReturnType<(typeof playerState)["use"]>;
type Props = { id: string | null; repeatMode?: boolean; canCF: boolean; setState: T[1] };

export const FXControls = memo(({ id, repeatMode, canCF, setState }: Props) => {
  const [, setScene] = sceneStore.use();
  const [open, setOpen] = useState(false);
  const [fx, setFx] = playerEffects.use();
  const [liked, setLiked] = likedSongsStore.use();
  const [sleepTime, setSleepTime] = sleepTimer.use();

  return (
    <div className="flex h-full w-full flex-row items-center justify-end gap-10 px-7">
      <div className="grid grid-cols-5 gap-5 xl:pr-3">
        <div
          id="crossfeed-button"
          children={<LuRotate3D />}
          style={{ opacity: canCF ? 1 : 0 }}
          onClick={() => canCF && setFx((s) => ({ ...s, CF: s.CF ? 0 : 0.5 }))}
          className={"active:scale-85" + (canCF ? " cursor-pointer" : "") + (fx.CF ? " text-(--accent-color)" : "")}
        />

        <div
          id="like-button"
          children={id && liked.includes(id) ? <RiHeartFill /> : <RiHeartLine />}
          className={"cursor-pointer active:scale-85 " + (liked.includes(id!) ? " text-(--accent-color)" : "")}
          onClick={() => id && setLiked((liked) => (liked.includes(id) ? liked.filter((e) => e !== id) : [...liked, id]))}
        />

        <div
          onClick={() => setState((_) => ({ ..._, loop: !_.loop }))}
          children={repeatMode ? <RiLoopRightAiLine /> : <RiLoopRightFill />}
          className={"cursor-pointer active:scale-85 " + (repeatMode ? " text-(--accent-color)" : "")}
        />

        <div id="sleep-button" onClick={() => setOpen(true)} children={<RiMoonFill />} className={"cursor-pointer active:scale-85 " + (sleepTime ? "text-(--accent-color)" : "")} />

        <div id="eq-button" onClick={() => setScene({ scene: "equalizer" })} children={<LuSlidersVertical />} className="cursor-pointer hover:text-(--accent-color) active:scale-85" />
      </div>

      <Volume FX={fx} setFX={setFx} />

      <Sleep show={open} setShow={setOpen} sleepTime={sleepTime} setSleepTime={setSleepTime} />
    </div>
  );
});
