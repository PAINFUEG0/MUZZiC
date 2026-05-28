import { ipcMain } from "electron";
import { api } from "./helpers/server";
import * as bin from "./helpers/binaries";
import { getLocalFileList } from "./helpers/local";

export function registerHandles() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("getPort", () => api.port);
  ipcMain.handle("list", () => getLocalFileList());

  ipcMain.handle("checkDLP", () => bin.checkDLP());
  ipcMain.handle("downloadDLP", () => bin.downloadDLP());

  ipcMain.handle("checkFFMPEG", () => bin.checkFFMPEG());
  ipcMain.handle("downloadFFMPEG", () => bin.downloadFFMPEG());

  ipcMain.handle("checkFFPROBE", () => bin.checkFFPROBE());
  ipcMain.handle("downloadFFPROBE", () => bin.downloadFFPROBE());
}
