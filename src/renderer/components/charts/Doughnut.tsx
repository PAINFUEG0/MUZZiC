/** @format */

import * as C from "chart.js";
import { useRef, useEffect, memo } from "react";

C.Chart.register(C.ArcElement, C.LineController, C.LineElement, C.PointElement, C.LinearScale, C.CategoryScale, C.PieController);

export const DoughnutChart = memo(({ data, size = 12 }: { data: { V: number; hex: string }[]; size?: number }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<C.Chart<"doughnut">>(null);

  useEffect(() => {
    if (canvas.current)
      chart.current = new C.Chart(canvas.current, {
        type: "doughnut",
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
        },
        data: {
          labels: data.map((_) => _.hex),
          datasets: [{ data: data.map((_) => _.V), borderWidth: 2, borderColor: "#00000022", backgroundColor: data.map((_) => _.hex) }],
        },
      });

    return () => chart.current?.destroy();
  }, []);

  useEffect(() => {
    chart.current && (chart.current.data.labels = data.map((_) => _.hex));
    chart.current && (chart.current.data.datasets[0]!.data = data.map((_) => _.V));
    chart.current && (chart.current.data.datasets[0]!.backgroundColor = data.map((_) => _.hex));
    chart.current && chart.current.update("none");
  }, [data]);

  return <div className="aspect-square" style={{ height: `calc(var(--spacing) * ${size})` }} children={<canvas ref={canvas} className="h-full w-full" />} />;
});
