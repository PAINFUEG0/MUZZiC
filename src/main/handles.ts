import { ipcMain } from "electron";
import { getLocalFileList } from "./helpers/local";
import { setupBinaries } from "./helpers/setupBinaries";

export function registerHandlers() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("ensureBinaries", setupBinaries);
  ipcMain.handle("list", () => getLocalFileList());
}
