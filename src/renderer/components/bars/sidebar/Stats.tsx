/** @format */

import { useState, useEffect, useRef } from "react";
import { themeStore } from "../../../utils/stores";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, ArcElement, PieController } from "chart.js";

Chart.register(ArcElement, LineController, LineElement, PointElement, LinearScale, CategoryScale, PieController);

export function Stats() {
  const count = 30;
  const [theme] = themeStore.use();
  const last = localStorage.getItem("resource_usage");
  const usage = last
    ? JSON.parse(last)
    : { CPU: 0, RAM: 0, cpu: { gpu: 0, tab: 0, browser: 0, utility: 0 }, mem: { gpu: 0, tab: 0, browser: 0, utility: 0 } };
  const [data, setData] = useState([...Array.from({ length: count }).map(() => usage)]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fn = async () => {
      const usage = await window.api.usage();
      localStorage.setItem("resource_usage", JSON.stringify(usage));
      setData((prev) => [...prev, usage].slice(-count));
    };

    fn().then(() => (interval = setInterval(fn, 1000 / 2)));

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-1.5 px-1">
      <div className="h-fit w-full text-center text-[10px] font-medium">Resource usage statistics</div>
      <div className="h-fit w-full text-center text-[9px] leading-none opacity-60">
        The graphs below are relative to the last 30 seconds
      </div>

      <div className="mt-2 grid h-auto w-full grid-cols-2 gap-1 gap-y-3">
        <div className="flex h-fit w-full flex-col gap-2">
          <div className="w-full text-center text-[8px] font-medium opacity-70">CPU Distribution ( % )</div>

          <div className="flex h-fit w-full flex-row gap-2">
            <div className="flex items-center justify-center" children={<PieChart data={Object.values(data.at(-1)!.cpu)} />} />

            <div className="flex h-full w-full flex-col items-start justify-center text-[8px]">
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}FF` }} />
                <div>Gpu - {data.at(-1)!.cpu.gpu!.toFixed(2)}</div>
              </div>
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}99` }} />
                <div>Tab - {data.at(-1)!.cpu.tab!.toFixed(2)}</div>
              </div>
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}66` }} />
                <div>Main - {data.at(-1)!.cpu.utility!.toFixed(2)}</div>
              </div>
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}33` }} />
                <div>Win - {data.at(-1)!.cpu.browser!.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-fit w-full flex-col gap-2">
          <div className="w-full text-center text-[8px] font-medium opacity-70">Memory Distribution ( MB )</div>

          <div className="flex h-fit w-full flex-row gap-2">
            <div className="flex items-center justify-center" children={<PieChart data={Object.values(data.at(-1)!.mem)} />} />

            <div className="flex h-full w-full flex-col items-start justify-center text-[8px]">
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}FF` }} />
                <div>Gpu - {data.at(-1)!.mem.gpu!.toFixed(2)}</div>
              </div>
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}99` }} />
                <div>Tab - {data.at(-1)!.mem.tab!.toFixed(2)}</div>
              </div>
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}66` }} />
                <div>Main - {data.at(-1)!.mem.utility!.toFixed(2)}</div>
              </div>
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square h-1 w-1 shrink-0" style={{ backgroundColor: `${theme.accent.substring(0, 7)}33` }} />
                <div>Win - {data.at(-1)!.mem.browser!.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-px flex h-fit w-full flex-col items-center gap-1.5">
          <MiniChart data={data.map((d) => d.CPU!)} />
          <div className="flex w-full flex-row justify-center gap-1 text-[8px] text-nowrap">
            <div>CPU</div>
            <div className="opacity-70">( {data.at(-1)!.CPU!.toFixed(3).padStart(6, "0")} % )</div>
          </div>
        </div>

        <div className="mb-px flex h-fit w-full flex-col items-center gap-1.5">
          <MiniChart data={data.map((d) => d.RAM!)} />
          <div className="flex w-full flex-row justify-center gap-1 text-[8px] text-nowrap">
            <div>RAM</div>
            <div className="opacity-70">( {data.at(-1)!.RAM!.toFixed(2).padStart(6, "0")} MB )</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: number[] }) {
  const [theme] = themeStore.use();
  const borderColor = theme.accent;
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

function PieChart({ data }: { data: number[] }) {
  const [theme] = themeStore.use();
  const chartRef = useRef<Chart<"pie">>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    `${theme.accent.substring(0, 7)}FF`,
    `${theme.accent.substring(0, 7)}AA`,
    `${theme.accent.substring(0, 7)}88`,
    `${theme.accent.substring(0, 7)}44`,
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current = new Chart(canvas, {
      type: "pie",
      data: {
        labels: data.map((_, i) => `Item ${i + 1}`),
        datasets: [{ data, borderWidth: 2, borderColor: "#00000022", backgroundColor: data.map((_, i) => colors[i % colors.length]) }],
      },
      options: {
        animation: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    });

    return () => chartRef.current?.destroy();
  }, [theme]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.data.datasets[0]!.data = data;
    chart.data.labels = data.map((_, i) => `Item ${i + 1}`);
    chart.data.datasets[0]!.backgroundColor = data.map((_, i) => colors[i % colors.length]);
    chart.update("active");
  }, [data]);

  return (
    <div className="aspect-square h-12">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
