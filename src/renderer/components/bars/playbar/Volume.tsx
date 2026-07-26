/** @format */

import Slider from "../../utils/Slider";
import { playerEffects } from "../../../utils/stores";
import { LuVolumeOff, LuVolume, LuVolume1, LuVolume2 } from "react-icons/lu";

export default function Volume() {
  const [FX, setFX] = playerEffects.use();

  return (
    <div className="flex h-fit w-fit flex-row items-center gap-1.5">
      {FX.muted || FX.volume === 0 ? (
        <button children={<LuVolumeOff className="w-5 cursor-pointer" onClick={() => setFX((s) => ({ ...s, muted: false }))} />} />
      ) : FX.volume > 0 && FX.volume <= 30 ? (
        <button children={<LuVolume className="w-5 cursor-pointer" onClick={() => setFX((s) => ({ ...s, muted: true }))} />} />
      ) : FX.volume > 30 && FX.volume <= 60 ? (
        <button children={<LuVolume1 className="w-5 cursor-pointer" onClick={() => setFX((s) => ({ ...s, muted: true }))} />} />
      ) : (
        <button children={<LuVolume2 className="w-5 cursor-pointer" onClick={() => setFX((s) => ({ ...s, muted: true }))} />} />
      )}

      <Slider
        min={0}
        step={1}
        max={100}
        className="h-1 w-25"
        value={FX.volume}
        thumb={{ height: "0.70rem", width: "0.70rem" }}
        onChange={(e) => setFX((s) => ({ ...s, volume: Number(e.target.value) }))}
      />

      <div className="flex w-7 flex-row items-center justify-start text-xs">{FX.volume}%</div>
    </div>
  );
}
