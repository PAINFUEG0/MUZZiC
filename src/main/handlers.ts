import { ipcMain } from "electron";
import { setupBinaries } from "./setupBinaries";
import { getLocalFileList } from "./local";

export function registerHandlers() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("ensureBinaries", setupBinaries);
  ipcMain.handle("list", () => getLocalFileList());
}
