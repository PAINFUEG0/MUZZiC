/** @format */

import { MiniChart } from "../charts/Line";
import { themeStore } from "../../stores/theme";
import { DoughnutChart } from "../charts/Doughnut";
import { useState, useEffect, useMemo, memo } from "react";

export const Stats = memo(() => {
  const count = 30;
  const [theme] = themeStore.use();

  const [data, setData] = useState(() => {
    const last = localStorage.getItem("resource_usage");
    const usage = last ? JSON.parse(last) : { CPU: 0, RAM: 0, cpu: { gpu: 0, tab: 0, browser: 0, utility: 0 }, mem: { gpu: 0, tab: 0, browser: 0, utility: 0 } };
    return Array.from({ length: count }).map(() => ({ ...usage }));
  });

  useEffect(() => {
    const fn = async () => {
      const usage = await window.api.usage();
      setData((prev) => [...prev, usage].slice(-count));
      localStorage.setItem("resource_usage", JSON.stringify(usage));
    };

    const interval = setInterval(fn, 1000);
    return () => clearInterval(interval);
  }, []);

  const usages = useMemo(
    () =>
      [
        { K: "gpu", label: "Gpu", hex: `${theme.accent.substring(0, 7)}FF` },
        { K: "tab", label: "Win", hex: `${theme.accent.substring(0, 7)}99` },
        { K: "utility", label: "Util", hex: `${theme.accent.substring(0, 7)}66` },
        { K: "browser", label: "Main", hex: `${theme.accent.substring(0, 7)}33` },
      ] as const,
    [theme],
  );

  const gridColor = useMemo(() => (theme.type === "dark" ? "rgb(255, 255, 255, 0.1)" : "rgb(0, 0, 0, 0.15)"), [theme]);

  return (
    <div className="flex h-full w-full flex-col gap-1.5 px-1">
      <div className="text-center text-[10px] font-medium" children="Resource usage statistics" />
      <div className="text-center text-[9px] leading-none opacity-60" children="The graphs below are relative to the last 30 seconds" />

      <div className="mt-2 grid h-auto w-full grid-cols-2 gap-1 gap-y-3">
        {(
          [
            { K: "cpu", label: "CPU Distribution ( % )" },
            { K: "mem", label: "Memory Distribution ( MB )" },
          ] as const
        ).map((_) => (
          <div key={_.label} className="flex h-fit w-full flex-col gap-2">
            <div className="w-full text-center text-[8px] font-medium opacity-70" children={_.label} />

            <div className="flex h-fit w-full flex-row gap-2">
              <div className="flex items-center justify-center" children={<DoughnutChart data={usages.map(({ K, hex }) => ({ V: data.at(-1)![_.K][K]!, hex }))} />} />

              <div className="flex h-full w-full flex-col items-start justify-center text-[8px]">
                {usages.map((__) => (
                  <div key={_.K + __.label} className="flex flex-row items-center gap-1">
                    <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: __.hex }} />
                    <div children={`${__.label} - ${data.at(-1)![_.K][__.K]!.toFixed(2)}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {(
          [
            { K: "CPU", label: "%", hex: `${theme.accent.substring(0, 7)}` },
            { K: "RAM", label: "MB", hex: `${theme.accent.substring(0, 7)}` },
          ] as const
        ).map((_) => (
          <div key={_.label} className="mb-px flex h-fit w-full flex-col items-center gap-1.5">
            <MiniChart data={data.map((d) => d[_.K])} borderColor={_.hex} gridColor={gridColor} />
            <div className="flex w-full flex-row justify-center gap-1 text-[8px] text-nowrap">
              <span children={_.K} />
              <div className="opacity-70" children={`( ${data.at(-1)![_.K].toFixed(3).padStart(6, "0")} ${_.label} )`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
