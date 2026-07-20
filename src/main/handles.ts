/** @format */

import eˉ from "electron";
import { api } from "./server";
import { API } from "../shared/types";
import * as local from "./helpers/local";
import * as constants from "./constants";
import * as bin from "./helpers/binaries.js";
import * as settings from "./helpers/settings";
import { transcode } from "./helpers/transcode";

import type { AxiosProgressEvent } from "axios";

const onProgress = (e: AxiosProgressEvent) => {
  api.broadcast({ type: "PROGRESS", data: "BIN", current: e.loaded, total: e.total ?? Number.NaN });
};

export function registerHandles(win: eˉ.BrowserWindow) {
  Object.entries({
    close: () => Promise.resolve(eˉ.app.quit()),
    minimize: () => Promise.resolve(win.minimize()),
    fullscreen: () => Promise.resolve(win.setFullScreen(!win.isFullScreen())),

    getPort: () => Promise.resolve(api.port),

    checkDLP: () => bin.checkForBinary("yt-dlp", "dlp", "--version"),
    downloadDLP: () => bin.downloadBinary(constants.DLP_BIN_URL, constants.bin.dlp, onProgress),

    checkFFMPEG: () => bin.checkForBinary("ffmpeg", "ffmpeg", "-v", "quiet"),
    downloadFFMPEG: () => bin.downloadBinary(constants.FFMPEG_BIN_URL, constants.bin.ffmpeg, onProgress),

    checkFFPROBE: () => bin.checkForBinary("ffprobe", "ffprobe", "-v", "quiet"),
    downloadFFPROBE: () => bin.downloadBinary(constants.FFPROBE_BIN_URL, constants.bin.ffprobe, onProgress),

    getMediaFolder: () => settings.getMediaFolder(),
    setMediaFolder: (_: eˉ.IpcMainInvokeEvent, ...args) => settings.setMediaFolder(...args),

    openFolderDialog: async () => (await eˉ.dialog.showOpenDialog({ properties: ["openDirectory"] })).filePaths?.[0] || null,

    scan: (_: eˉ.IpcMainInvokeEvent, ...args) => local.scan(...args),

    getTree: (_: eˉ.IpcMainInvokeEvent, ...args) => local.getTree(...args),
    setTree: (_: eˉ.IpcMainInvokeEvent, ...args) => local.setTree(...args),
    deleteTree: (_: eˉ.IpcMainInvokeEvent, ...args) => local.deleteTree(...args),

    getAllMeta: (_: eˉ.IpcMainInvokeEvent) => local.getAllMeta(),
    setMeta: (_: eˉ.IpcMainInvokeEvent, ...args) => local.setMeta(...args),
    getMeta: (_: eˉ.IpcMainInvokeEvent, ...args) => local.getMeta(...args),
    deleteMeta: (_: eˉ.IpcMainInvokeEvent, ...args) => local.deleteMeta(...args),

    extractAndSaveMetadata: (_: eˉ.IpcMainInvokeEvent, ...args) => local.extractAndSaveMetadata(...args),

    getPcmFormat: (_: eˉ.IpcMainInvokeEvent) => settings.getPcmFormat(),
    setPcmFormat: (_: eˉ.IpcMainInvokeEvent, ...args) => settings.setPcmFormat(...args),

    transcode: (_: eˉ.IpcMainInvokeEvent, ...args) => transcode(...args),

    usage: (_: eˉ.IpcMainInvokeEvent) => {
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
    },
  } satisfies {
    [K in keyof API]: (event: eˉ.IpcMainInvokeEvent, ...args: Parameters<API[K]>) => ReturnType<API[K]>;
  }).forEach(([K, V]) => eˉ.ipcMain.handle(K, V));
}
