/** @format */

import eˉ from "electron";
import { api } from "./server";
import { API } from "../shared/types";
import * as local from "./helpers/local";
import * as constants from "./constants";
import * as bin from "./helpers/binaries.js";
import * as settings from "./helpers/settings";
import { transcode } from "./helpers/transcode";
import { getResourceUsages } from "./helpers/usages";

import type { AxiosProgressEvent } from "axios";

export function registerHandles(win: eˉ.BrowserWindow) {
  Object.entries({
    getPort: () => Promise.resolve(api.port),
    getThumbPath: () => Promise.resolve(constants.directories.thumbnails),

    checkDLP: () => bin.checkBinary(constants.bin.dlp.path, "--version"),
    checkFFMPEG: () => bin.checkBinary(constants.bin.ffmpeg.path, "-v", "quiet"),
    checkFFPROBE: () => bin.checkBinary(constants.bin.ffprobe.path, "-v", "quiet"),

    downloadDLP: () => bin.downloadBinary(constants.bin.dlp, onProgress),
    downloadFFMPEG: () => bin.downloadBinary(constants.bin.ffmpeg, onProgress),
    downloadFFPROBE: () => bin.downloadBinary(constants.bin.ffprobe, onProgress),

    getMediaFolder: () => settings.getMediaFolder(),
    getAllMeta: (_: eˉ.IpcMainInvokeEvent) => local.getAllMeta(),
    getPcmFormat: (_: eˉ.IpcMainInvokeEvent) => settings.getPcmFormat(),
    getMeta: (_: eˉ.IpcMainInvokeEvent, ...args) => local.getMeta(...args),
    getTree: (_: eˉ.IpcMainInvokeEvent, ...args) => local.getTree(...args),

    setTree: (_: eˉ.IpcMainInvokeEvent, ...args) => local.setTree(...args),
    setMeta: (_: eˉ.IpcMainInvokeEvent, ...args) => local.setMeta(...args),
    setPcmFormat: (_: eˉ.IpcMainInvokeEvent, ...args) => settings.setPcmFormat(...args),
    setMediaFolder: (_: eˉ.IpcMainInvokeEvent, ...args) => settings.setMediaFolder(...args),

    deleteMeta: (_: eˉ.IpcMainInvokeEvent, ...args) => local.deleteMeta(...args),
    deleteTree: (_: eˉ.IpcMainInvokeEvent, ...args) => local.deleteTree(...args),

    scan: (_: eˉ.IpcMainInvokeEvent, ...args) => local.scan(...args),
    transcode: (_: eˉ.IpcMainInvokeEvent, ...args) => transcode(...args),
    deleteThumbnails: (_: eˉ.IpcMainInvokeEvent, ...args) => local.deleteThumbnails(...args),
    extractAndSaveMetadata: (_: eˉ.IpcMainInvokeEvent, ...args) => local.extractAndSaveMetadata(...args),

    close: () => Promise.resolve(eˉ.app.quit()),
    minimize: () => Promise.resolve(win.minimize()),
    usage: (_: eˉ.IpcMainInvokeEvent, ...args) => getResourceUsages(...args),
    fullscreen: () => Promise.resolve(win.setFullScreen(!win.isFullScreen())),
    openFolderDialog: async () => (await eˉ.dialog.showOpenDialog({ properties: ["openDirectory"] })).filePaths?.[0] || null,
  } satisfies {
    [K in keyof API]: (event: eˉ.IpcMainInvokeEvent, ...args: Parameters<API[K]>) => ReturnType<API[K]>;
  }).forEach(([K, V]) => eˉ.ipcMain.handle(K, V));
}

const onProgress = (e: AxiosProgressEvent) => api.broadcast({ type: "PROGRESS", data: "BIN", current: e.loaded, total: e.total ?? Number.NaN });
