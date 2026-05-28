import { api } from "./helpers/server";
import * as local from "./helpers/local";
import * as bin from "./helpers/binaries";
import { dialog, ipcMain } from "electron";

export function registerHandles() {
  ipcMain.handle("getPort", () => api.port);

  ipcMain.handle("checkDLP", () => bin.checkDLP());
  ipcMain.handle("downloadDLP", () => bin.downloadDLP());

  ipcMain.handle("checkFFMPEG", () => bin.checkFFMPEG());
  ipcMain.handle("downloadFFMPEG", () => bin.downloadFFMPEG());

  ipcMain.handle("checkFFPROBE", () => bin.checkFFPROBE());
  ipcMain.handle("downloadFFPROBE", () => bin.downloadFFPROBE());

  ipcMain.handle("getMediaFolder", () => local.getMediaFolder());
  ipcMain.handle("setMediaFolder", (_, dir) => local.setMediaFolder(dir));

  ipcMain.handle("open-folder-dialog", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle("list", () => local.getMediaFilesTree());
}
