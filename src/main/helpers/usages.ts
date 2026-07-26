/** @format */

import eˉ from "electron";

export function getResourceUsages() {
  const usage = eˉ.app.getAppMetrics();

  const F = (__: eˉ.ProcessMetric[]) => ({
    cpu: __[0]?.cpu.percentCPUUsage || 0,
    mem: Number((((__[0]?.memory.privateBytes ?? __[0]?.memory.workingSetSize) || 0) / 1024).toFixed(2)),
  });

  const gpuUsage = F(usage.filter((m) => m.type === "GPU"));
  const tabUsage = F(usage.filter((m) => m.type === "Tab"));
  const browserUsage = F(usage.filter((m) => m.type === "Browser"));
  const utilityUsage = F(usage.filter((m) => m.type === "Utility"));

  return Promise.resolve({
    CPU: tabUsage.cpu + browserUsage.cpu + utilityUsage.cpu,
    RAM: tabUsage.mem + browserUsage.mem + utilityUsage.mem,
    cpu: { gpu: gpuUsage.cpu, tab: tabUsage.cpu, browser: browserUsage.cpu, utility: utilityUsage.cpu },
    mem: { gpu: gpuUsage.mem, tab: tabUsage.mem, browser: browserUsage.mem, utility: utilityUsage.mem },
  });
}
