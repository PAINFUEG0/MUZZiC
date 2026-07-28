/** @format */

import Slider from "../utils/Slider";
import { playerEffects } from "../../player";
import { memo, useEffect, useState } from "react";
import { LuVolumeOff, LuVolume, LuVolume1, LuVolume2 } from "react-icons/lu";

type _ = ReturnType<(typeof playerEffects)["use"]>;

export const Volume = memo(({ FX, setFX }: { FX: _[0]; setFX: _[1] }) => {
  const [T, setT] = useState<"IG" | "PG">("PG");

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "INPUT") return;

      const keybinds: Record<string, () => void> = {
        ArrowUp: () => (e.preventDefault(), setFX((_) => ({ ..._, [T]: Math.min(100, _[T] + 5) }))),
        ArrowDown: () => (e.preventDefault(), setFX((_) => ({ ..._, [T]: Math.max(0, _[T] - 5) }))),
      };

      e.code in keybinds && keybinds[e.code]!();
    };

    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [T]);

  return (
    <div className="flex h-fit flex-col">
      <div className="-mt-4 flex h-fit w-full flex-row items-center justify-center gap-1.5 text-[10px]">
        <div children="PRE" className={"cursor-pointer " + (T === "IG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setT("IG")} />
        <div children="/" />
        <div children="POST" className={"cursor-pointer " + (T === "PG" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setT("PG")} />
      </div>

      <div className="flex h-fit w-fit flex-row items-center gap-1.5">
        {FX.mute || FX[T] === 0 ? (
          <button children={<LuVolumeOff className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: false }))} />} />
        ) : FX[T] > 0 && FX[T] <= 30 ? (
          <button children={<LuVolume className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: true }))} />} />
        ) : FX[T] > 30 && FX[T] <= 60 ? (
          <button children={<LuVolume1 className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: true }))} />} />
        ) : (
          <button children={<LuVolume2 className="w-5 cursor-pointer" onClick={() => setFX((s: any) => ({ ...s, mute: true }))} />} />
        )}

        <Slider
          min={0}
          step={1}
          max={100}
          value={FX[T]}
          className="h-1 w-25"
          thumb={{ height: "0.70rem", width: "0.70rem" }}
          onChange={(e) => setFX((s: any) => ({ ...s, [T]: Number(e.target.value) }))}
        />

        <div className="flex w-7 flex-row items-center justify-start text-xs">{FX[T]}%</div>
      </div>
    </div>
  );
});
