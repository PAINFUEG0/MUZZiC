/** @format */

import { useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, CartesianGrid } from "recharts";

export function Stats() {
  const [data, setData] = useState<{ cpu: number; mem: number }[]>(Array.from({ length: 30 }, () => ({ cpu: 0, mem: 0 })));

  useEffect(() => {
    const interval = setInterval(async () => {
      const usage = await window.api.usage();
      setData((prev) => [...prev, { ...usage, mem: Number((usage.mem / 1024 / 1024).toFixed(2)) }].slice(-30));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const CPU = (
    <div className="flex h-fit w-full gap-2 pt-1 pl-2">
      <div className="flex flex-col text-[10px] text-nowrap">
        <div>CPU usage</div>
        <div>{data.at(-1)!.cpu.toFixed(3).padStart(6, "0")} %</div>
      </div>

      <div className="h-full w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid opacity={0.2} />
            <Line type="monotone" dataKey="cpu" dot={false} strokeWidth={2} isAnimationActive={false} stroke="var(--accent-color)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const RAM = (
    <div className="flex h-fit w-full gap-2 pt-1 pl-2">
      <div className="flex flex-col text-[10px] text-nowrap">
        <div>RAM usage</div>
        <div>{data.at(-1)!.mem} MiB</div>
      </div>

      <div className="h-full w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid opacity={0.2} />
            <Line type="monotone" dataKey="mem" dot={false} strokeWidth={2} isAnimationActive={false} stroke="var(--accent-color)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return [CPU, RAM];
}
