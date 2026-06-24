/** @format */

import { api } from "./server";
import { API } from "../shared/types";
import * as local from "./helpers/local";
import * as bin from "./helpers/binaries";
import * as settings from "./helpers/settings";
import { app, BrowserWindow, dialog, ipcMain, IpcMainInvokeEvent } from "electron";

export function registerHandles(win: BrowserWindow) {
  Object.entries({
    close: () => Promise.resolve(app.quit()),
    minimize: () => Promise.resolve(win.minimize()),
    fullscreen: () => Promise.resolve(win.setFullScreen(!win.isFullScreen())),

    getPort: () => api.port,

    checkDLP: () => bin.checkDLP(),
    downloadDLP: () => bin.downloadDLP(),

    checkFFMPEG: () => bin.checkFFMPEG(),
    checkFFPROBE: () => bin.checkFFPROBE(),

    downloadFFMPEG: () => bin.downloadFFMPEG(),
    downloadFFPROBE: () => bin.downloadFFPROBE(),

    getMediaFolder: () => settings.getMediaFolder(),
    setMediaFolder: (_: IpcMainInvokeEvent, ...args) => settings.setMediaFolder(...args),

    openFolderDialog: async () => (await dialog.showOpenDialog({ properties: ["openDirectory"] })).filePaths?.[0] || null,

    scan: (_: IpcMainInvokeEvent, ...args) => local.scan(...args),

    getTree: (_: IpcMainInvokeEvent, ...args) => local.getTree(...args),
    setTree: (_: IpcMainInvokeEvent, ...args) => local.setTree(...args),

    setMeta: (_: IpcMainInvokeEvent, ...args) => local.setMeta(...args),
    getMeta: (_: IpcMainInvokeEvent, ...args) => local.getMeta(...args),
    deleteMeta: (_: IpcMainInvokeEvent, ...args) => local.deleteMeta(...args),

    extractMetadata: (_: IpcMainInvokeEvent, ...args) => local.extractMetadata(...args),
  } satisfies {
    [K in keyof API]: (event: IpcMainInvokeEvent, ...args: Parameters<API[K]>) => ReturnType<API[K]>;
  }).forEach(([K, V]) => ipcMain.handle(K, V));
}
