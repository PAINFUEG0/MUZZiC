/** @format */

import * as C from "chart.js";
import { useRef, useEffect } from "react";

C.Chart.register(C.ArcElement, C.LineController, C.LineElement, C.PointElement, C.LinearScale, C.CategoryScale, C.PieController);

export function MiniChart({ data, height = 7, width = "100%", borderColor, gridColor }: { data: number[]; gridColor: string; height?: number | string; width?: number | string; borderColor: string }) {
  const color = gridColor;
  const chart = useRef<C.Chart<"line">>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const plugins = { legend: { display: false }, tooltip: { enabled: false } };
    const x = { border: { display: false }, ticks: { display: false, count: 5 }, grid: { display: true, drawTicks: false, color } };
    const y = { border: { display: false }, ticks: { display: false, count: 4 }, grid: { display: true, drawTicks: false, color } };

    if (canvas.current)
      chart.current = new C.Chart(canvas.current, {
        type: "line",
        options: { plugins, scales: { x, y }, animation: false, responsive: true, maintainAspectRatio: false },
        data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor, borderWidth: 2, pointRadius: 0, tension: 0.35 }] },
      });

    return () => chart.current?.destroy();
  }, []);

  useEffect(() => {
    chart.current && (chart.current.data.datasets[0]!.borderColor = borderColor);
    chart.current && (chart.current.data.labels = data.map((_, i) => i));
    chart.current && (chart.current.data.datasets[0]!.data = data);
    chart.current && chart.current.update("none");
  }, [data]);

  return (
    <div
      children={<canvas ref={canvas} className="h-full w-full" />}
      style={{
        width: typeof width === "string" ? width : `calc(var(--spacing) * ${width})`,
        height: typeof height === "string" ? height : `calc(var(--spacing) * ${height})`,
      }}
    />
  );
}
