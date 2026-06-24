/** @format */

import { api } from "./server";
import * as local from "./helpers/local";
import * as bin from "./helpers/binaries";
import { dialog, ipcMain } from "electron";
import * as settings from "./helpers/settings";

export function registerHandles() {
  ipcMain.handle("getPort", () => api.port);

  ipcMain.handle("checkDLP", () => bin.checkDLP());
  ipcMain.handle("downloadDLP", () => bin.downloadDLP());

  ipcMain.handle("checkFFMPEG", () => bin.checkFFMPEG());
  ipcMain.handle("downloadFFMPEG", () => bin.downloadFFMPEG());

  ipcMain.handle("checkFFPROBE", () => bin.checkFFPROBE());
  ipcMain.handle("downloadFFPROBE", () => bin.downloadFFPROBE());

  ipcMain.handle("getMediaFolder", () => settings.getMediaFolder());
  ipcMain.handle("setMediaFolder", (_, dir) => settings.setMediaFolder(dir));

  ipcMain.handle("open-folder-dialog", async () => (await dialog.showOpenDialog({ properties: ["openDirectory"] })).filePaths?.[0]);

  ipcMain.handle("scan", (_, dir) => local.scan(dir));

  ipcMain.handle("getTree", (_, K) => local.getTree(K));
  ipcMain.handle("setTree", (_, K, V) => local.setTree(K, V));

  ipcMain.handle("extractMetadata", (_, flat) => local.extractMetadata(flat));

  ipcMain.handle("getMeta", (_, K) => local.getMeta(K));
  ipcMain.handle("setMeta", (_, K, V) => local.setMeta(K, V));
  ipcMain.handle("deleteMeta", (_, K) => local.deleteMeta(K));
}
