/** @format */

import { api } from "./server";
import { API } from "../shared/types";
import * as local from "./helpers/local";
import * as bin from "./helpers/binaries";
import * as settings from "./helpers/settings";
import { dialog, ipcMain, IpcMainInvokeEvent } from "electron";

export function registerHandles() {
  handle("getPort", () => api.port);
  handle("checkDLP", () => bin.checkDLP());
  handle("downloadDLP", () => bin.downloadDLP());
  handle("checkFFMPEG", () => bin.checkFFMPEG());
  handle("checkFFPROBE", () => bin.checkFFPROBE());
  handle("scan", (_, ...args) => local.scan(...args));
  handle("downloadFFMPEG", () => bin.downloadFFMPEG());
  handle("downloadFFPROBE", () => bin.downloadFFPROBE());
  handle("getMediaFolder", () => settings.getMediaFolder());
  handle("getTree", (_, ...args) => local.getTree(...args));
  handle("setTree", (_, ...args) => local.setTree(...args));
  handle("setMeta", (_, ...args) => local.setMeta(...args));
  handle("getMeta", (_, ...args) => local.getMeta(...args));
  handle("deleteMeta", (_, ...args) => local.deleteMeta(...args));
  handle("extractMetadata", (_, ...args) => local.extractMetadata(...args));
  handle("setMediaFolder", (_, ...args) => settings.setMediaFolder(...args));
  handle("openFolderDialog", async () => (await dialog.showOpenDialog({ properties: ["openDirectory"] })).filePaths?.[0] || null);
}

function handle<K extends keyof API>(channel: K, listener: (event: IpcMainInvokeEvent, ...args: Parameters<API[K]>) => ReturnType<API[K]>) {
  ipcMain.handle(channel as string, listener);
}
