/** @format */

import { memo, useState } from "react";
import Slider from "../utils/Slider";
import { playerEffects } from "../../player";
import { LuVolumeOff, LuVolume, LuVolume1, LuVolume2 } from "react-icons/lu";
import { logToPercent, percentToLog } from "../../../shared/helpers";

type T = ReturnType<(typeof playerEffects)["use"]>;

export const Volume = memo(({ FX, setFX }: { FX: T[0]; setFX: T[1] }) => {
  const [T, setT] = useState<"IG" | "PG">("PG");
  const U = logToPercent(FX[T]);

  return (
    <div className="flex h-fit flex-col">
      <div className="-mt-4 flex h-fit w-full flex-row items-center justify-center gap-1.5 text-[10px]">
        <div children="PRE" className={"cursor-pointer " + (T === "IG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setT("IG")} />
        <div children="/" />
        <div children="POST" className={"cursor-pointer " + (T === "PG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setT("PG")} />
      </div>

      <div className="flex h-fit w-fit flex-row items-center gap-1.5">
        {FX.mute || U === 0 ? (
          <button children={<LuVolumeOff className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: false }))} />} />
        ) : U > 0 && U <= 30 ? (
          <button children={<LuVolume className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: true }))} />} />
        ) : U > 30 && U <= 60 ? (
          <button children={<LuVolume1 className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: true }))} />} />
        ) : (
          <button children={<LuVolume2 className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: true }))} />} />
        )}

        <Slider
          min={0}
          step={1}
          max={120}
          value={U}
          className="h-1 w-25"
          thumb={{ height: "0.70rem", width: "0.70rem" }}
          onChange={(e) => setFX((s: any) => ({ ...s, [T]: percentToLog(Number(e.target.value)) }))}
        />

        <div className="flex w-7 flex-row items-center justify-start text-xs">{U}%</div>
      </div>
    </div>
  );
});
