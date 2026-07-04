/** @format */

import { useState, useEffect, useRef } from "react";
import { themeStore } from "../../../utils/globalStores";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

export function Stats() {
  const count = 30;
  const [data, setData] = useState<{ cpu: number; mem: number }[]>(Array.from({ length: count }, () => ({ cpu: 0, mem: 0 })));

  useEffect(() => {
    const interval = setInterval(async () => {
      const usage = await window.api.usage();
      setData((prev) => [...prev, { ...usage, mem: Number((usage.mem / 1024 / 1024).toFixed(2)) }].slice(-count));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-2 px-1">
      <div className="h-fit w-full text-center text-[10px] font-medium">Resource usage statistics</div>
      <div className="-mt-1.25 mb-1 h-fit w-full text-center text-[9px] leading-none opacity-60">
        The graphs below are relative to the last 30 seconds
      </div>

      <div className="mb-px flex h-fit w-full flex-row items-center gap-1.5">
        <div className="flex w-[20%] flex-col text-[10px] text-nowrap">
          <div>CPU usage</div>
          <div>{data.at(-1)!.cpu.toFixed(3).padStart(6, "0")} %</div>
        </div>

        <MiniChart data={data.map((d) => d.cpu)} />
      </div>

      <div className="flex h-fit w-full flex-row items-center gap-1.5">
        <div className="flex w-[20%] flex-col text-[10px] text-nowrap">
          <div>RAM usage</div>
          <div>{data.at(-1)!.mem} MB</div>
        </div>

        <MiniChart data={data.map((d) => d.mem)} />
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: number[] }) {
  const [theme] = themeStore.use();
  const borderColor = theme.color;
  const chartRef = useRef<Chart<"line">>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const color = theme.type === "dark" ? "rgb(255, 255, 255, 0.1)" : "rgb(0, 0, 0, 0.15)";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const plugins = { legend: { display: false }, tooltip: { enabled: false } };
    const x = { border: { display: false }, ticks: { display: false, count: 5 }, grid: { display: true, drawTicks: false, color } };
    const y = { border: { display: false }, ticks: { display: false, count: 4 }, grid: { display: true, drawTicks: false, color } };

    chartRef.current = new Chart(canvas, {
      type: "line",
      options: { plugins, scales: { x, y }, animation: false, responsive: true, maintainAspectRatio: false },
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor, borderWidth: 2, pointRadius: 0, tension: 0.35 }] },
    });

    return () => chartRef.current?.destroy();
  }, [theme]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.data.labels = data.map((_, i) => i);
    chart.data.datasets[0]!.data = data;
    chart.update("none");
  }, [data]);

  return <div className="h-7 w-full" children={<canvas ref={canvasRef} className="h-full w-full" />} />;
}
