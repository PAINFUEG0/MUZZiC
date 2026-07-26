/** @format */

import { memo } from "react";
import { Volume } from "./Volume";
import { SiDolby } from "react-icons/si";
import { playerEffects } from "../../player";
import { likedSongsStore } from "../../utils/stores";
import { TbBrandDolbyDigital } from "react-icons/tb";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";
import { LuCircleGauge, LuSlidersVertical } from "react-icons/lu";

export const FXControls = memo(({ id }: { id: string | null }) => {
  const [fx, setFx] = playerEffects.use();
  const [liked, setLiked] = likedSongsStore.use();

  return (
    <div className="flex h-full w-full flex-row items-center justify-between gap-2">
      <div className="flex w-full flex-row items-center justify-between px-10">
        <div className="flex w-full flex-row items-center justify-center gap-5">
          {fx.crossfeed ? (
            <SiDolby
              className="m-0.5 cursor-pointer text-(--accent-color) active:scale-85"
              onClick={() => setFx((s) => ({ ...s, crossfeed: false }))}
            />
          ) : (
            <TbBrandDolbyDigital
              className="cursor-pointer text-xl hover:text-(--accent-color) active:scale-85"
              onClick={() => setFx((s) => ({ ...s, crossfeed: true }))}
            />
          )}
          {id && liked.includes(id) ? (
            <RiHeartFill
              className="cursor-pointer text-lg text-(--accent-color) active:scale-85"
              onClick={() => setLiked((liked) => liked.filter((e) => e !== id))}
            />
          ) : (
            <RiHeartLine
              className="cursor-pointer text-lg hover:text-(--accent-color) active:scale-85"
              onClick={() => id && setLiked((liked) => [...liked, id])}
            />
          )}

          <LuCircleGauge className="cursor-pointer hover:text-(--accent-color) active:scale-85" onClick={() => {}} />
          <LuSlidersVertical className="cursor-pointer hover:text-(--accent-color) active:scale-85" onClick={() => {}} />
        </div>

        <Volume FX={fx} setFX={setFx} />
      </div>
    </div>
  );
});
