/** @format */

import { memo } from "react";
import { playerEffects } from "../stores";
import { LuRotateCcw } from "react-icons/lu";
import Slider from "../components/utils/Slider";

export const Effects = memo(() => {
  const [fx, setFX] = playerEffects.use();

  return (
    <div className="flex h-full w-full flex-row gap-10">
      <div className="flex w-full flex-row items-center gap-5">
        <div className="text-xs text-nowrap">Crossfeed intensity</div>
        <Slider
          min={0}
          step={1}
          max={100}
          value={fx.CF.amount}
          disabled={!fx.CF.enabled}
          className="disabled:opacity-50"
          onChange={(e) => setFX((_) => ({ ..._, CF: { ..._.CF, amount: Number(e.target.value) } }))}
        />
        <div className="w-15 text-xs text-nowrap">{fx.CF.amount} %</div>
        <LuRotateCcw className="cursor-pointer text-xl transition-all active:scale-95" onClick={() => setFX((_) => ({ ..._, CF: { ..._.CF, amount: 30 } }))} />
      </div>

      <div className="flex w-full flex-row items-center gap-5">
        <div className="text-xs text-nowrap">Crossfeed frequency</div>
        <Slider
          min={0}
          step={1}
          max={2000}
          value={fx.CF.frequency}
          disabled={!fx.CF.enabled}
          className="disabled:opacity-50"
          onChange={(e) => setFX((_) => ({ ..._, CF: { ..._.CF, frequency: Number(e.target.value) } }))}
        />
        <div className="w-15 text-xs text-nowrap">{fx.CF.frequency} Hz</div>
        <LuRotateCcw className="cursor-pointer text-xl transition-all active:scale-95" onClick={() => setFX((_) => ({ ..._, CF: { ..._.CF, frequency: 650 } }))} />
      </div>
    </div>
  );
});
