/** @format */

import Slider from "../utils/Slider";
import { playerEffects } from "../../player";
import { memo, useState } from "react";
import { LuVolumeOff, LuVolume, LuVolume1, LuVolume2 } from "react-icons/lu";

type _ = ReturnType<(typeof playerEffects)["use"]>;

export const Volume = memo(({ FX, setFX }: { FX: _[0]; setFX: _[1] }) => {
  const [T, setT] = useState<"IG" | "PG">("PG");

  return (
    <div className="flex h-fit flex-col">
      <div className="-mt-4 flex h-fit w-full flex-row items-center justify-center gap-1.5 text-[10px]">
        <div children="PRE" className={"cursor-pointer " + (T === "IG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setT("IG")} />
        <div children="/" />
        <div children="POST" className={"cursor-pointer " + (T === "PG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setT("PG")} />
      </div>

      <div className="flex h-fit w-fit flex-row items-center gap-1.5">
        <div id="mute-unmute-button" onClick={() => setFX((_) => ({ ..._, mute: !_.mute }))} className="w-5 cursor-pointer">
          {FX.mute || FX[T] === 0 ? <LuVolumeOff /> : FX[T] > 0 && FX[T] <= 30 ? <LuVolume /> : FX[T] > 30 && FX[T] <= 60 ? <LuVolume1 /> : <LuVolume2 />}
        </div>

        <Slider
          min={0}
          step={1}
          value={FX[T]}
          className="h-1 w-25"
          max={T === "PG" ? 150 : 100}
          thumb={{ height: "0.70rem", width: "0.70rem" }}
          onChange={(e) => setFX((s: any) => ({ ...s, [T]: Number(e.target.value) }))}
        />

        <div className="flex w-7 flex-row items-center justify-start text-xs">{FX[T]}%</div>
      </div>
    </div>
  );
});
