/** @format */

import { api } from "./server";
import { API } from "../shared/types";
import { setMediaFolder, getMediaFolder } from "./helpers/settings";
import { app, BrowserWindow, dialog, ipcMain, IpcMainInvokeEvent } from "electron";
import { scan, getTree, setTree, setMeta, getMeta, deleteMeta, extractMetadata } from "./helpers/local";
import { checkDLP, downloadDLP, checkFFMPEG, checkFFPROBE, downloadFFMPEG, downloadFFPROBE } from "./helpers/binaries";

export function registerHandles(win: BrowserWindow) {
  Object.entries({
    close: () => Promise.resolve(app.quit()),
    minimize: () => Promise.resolve(win.minimize()),
    fullscreen: () => Promise.resolve(win.setFullScreen(!win.isFullScreen())),

    getPort: () => api.port,

    checkDLP: () => checkDLP(),
    downloadDLP: () => downloadDLP(),

    checkFFMPEG: () => checkFFMPEG(),
    checkFFPROBE: () => checkFFPROBE(),

    downloadFFMPEG: () => downloadFFMPEG(),
    downloadFFPROBE: () => downloadFFPROBE(),

    getMediaFolder: () => getMediaFolder(),
    setMediaFolder: (_: IpcMainInvokeEvent, ...args) => setMediaFolder(...args),

    openFolderDialog: async () => (await dialog.showOpenDialog({ properties: ["openDirectory"] })).filePaths?.[0] || null,

    scan: (_: IpcMainInvokeEvent, ...args) => scan(...args),

    getTree: (_: IpcMainInvokeEvent, ...args) => getTree(...args),
    setTree: (_: IpcMainInvokeEvent, ...args) => setTree(...args),

    setMeta: (_: IpcMainInvokeEvent, ...args) => setMeta(...args),
    getMeta: (_: IpcMainInvokeEvent, ...args) => getMeta(...args),
    deleteMeta: (_: IpcMainInvokeEvent, ...args) => deleteMeta(...args),

    extractMetadata: (_: IpcMainInvokeEvent, ...args) => extractMetadata(...args),
  } satisfies {
    [K in keyof API]: (event: IpcMainInvokeEvent, ...args: Parameters<API[K]>) => ReturnType<API[K]>;
  }).forEach(([K, V]) => ipcMain.handle(K, V));
}
