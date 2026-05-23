import { ipcMain } from "electron";
import { api } from "./helpers/server";
import { getLocalFileList } from "./helpers/local";
import { ensureBinaries } from "./helpers/binaries";

export function registerHandles() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("getPort", () => api.port);
  ipcMain.handle("list", () => getLocalFileList());
  ipcMain.handle("ensureBinaries", () => ensureBinaries());
}
