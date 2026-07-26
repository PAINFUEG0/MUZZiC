/** @format */

import { memo } from "react";
import { VUMeter } from "./VuMeter";
import useVU from "../../player/volumeUnit";

export const VU = memo(() => {
  const { VUL, VUR } = useVU();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-row items-center">
        <div className="w-5 shrink-0 px-2 text-[8px] text-nowrap opacity-80">L</div>
        <VUMeter dbfs={VUL} />
        <div className="w-fit min-w-0 shrink px-2 text-[8px] text-nowrap opacity-80">
          {"- " + (VUL * -1).toFixed(2).padStart(5, "0")} dBFS
        </div>
      </div>

      <div className="flex w-full flex-row items-center">
        <div className="w-5 shrink-0 px-2 text-[8px] text-nowrap opacity-80">R</div>
        <VUMeter dbfs={VUR} />
        <div className="w-fit min-w-0 shrink px-2 text-[8px] text-nowrap opacity-80">
          {"- " + (VUR * -1).toFixed(2).padStart(5, "0")} dBFS
        </div>
      </div>
    </div>
  );
});
