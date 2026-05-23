import { ipcMain } from "electron";
import { getLocalFileList } from "./helpers/local";
import { ensureBinaries } from "./helpers/binaries";

export function registerHandlers() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("ensureBinaries", ensureBinaries);
  ipcMain.handle("list", () => getLocalFileList());
}
