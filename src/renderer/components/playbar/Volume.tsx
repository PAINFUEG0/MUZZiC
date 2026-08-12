/** @format */

import Slider from "../utils/Slider";
import { memo, useState } from "react";
import { playerEffects } from "../../player";
import { LuVolumeOff, LuVolume, LuVolume1, LuVolume2 } from "react-icons/lu";

type _ = ReturnType<(typeof playerEffects)["use"]>;

export const Volume = memo(({ FX, setFX }: { FX: _[0]; setFX: _[1] }) => {
  const [gainType, setGainType] = useState<"IG" | "PG">("PG");

  return (
    <div className="flex h-fit flex-col">
      <div className="-mt-4 flex h-fit w-full flex-row items-center justify-center gap-1.5 text-[10px]">
        <div children="PRE" className={"cursor-pointer " + (gainType === "IG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setGainType("IG")} />
        <div children="/" />
        <div children="POST" className={"cursor-pointer " + (gainType === "PG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setGainType("PG")} />
      </div>

      <div className="flex h-fit w-fit flex-row items-center gap-1.5">
        <div id="mute-unmute-button" onClick={() => setFX((_) => ({ ..._, mute: !_.mute }))} className="w-5 cursor-pointer">
          {FX.mute || FX[gainType] === 0 ? <LuVolumeOff /> : FX[gainType] > 0 && FX[gainType] <= 30 ? <LuVolume /> : FX[gainType] > 30 && FX[gainType] <= 60 ? <LuVolume1 /> : <LuVolume2 />}
        </div>

        <Slider
          min={0}
          step={1}
          value={FX[gainType]}
          className="h-1 w-25"
          max={gainType === "PG" ? 150 : 100}
          thumb={{ height: "0.70rem", width: "0.70rem" }}
          onChange={(e) => setFX((s: any) => ({ ...s, [gainType]: Number(e.target.value) }))}
        />

        <div className="flex w-7 flex-row items-center justify-start text-xs">{FX[gainType]}%</div>
      </div>
    </div>
  );
});
