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

    getPort: () => api.port,

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

    usage: async (_: eˉ.IpcMainInvokeEvent) => {
      return eˉ.app
        .getAppMetrics()
        .filter((m) => m.type !== "GPU")
        .reduce(
          (acc, curr) => {
            acc.cpu += curr.cpu.percentCPUUsage;
            acc.mem += (curr.memory.privateBytes ?? curr.memory.workingSetSize) * 1024;
            return acc;
          },
          { cpu: 0, mem: 0 },
        );
    },
  } satisfies {
    [K in keyof API]: (event: eˉ.IpcMainInvokeEvent, ...args: Parameters<API[K]>) => ReturnType<API[K]>;
  }).forEach(([K, V]) => eˉ.ipcMain.handle(K, V));
}
