import * as path from "node:path";
import { api } from "./helpers/server";
import { registerHandles } from "./handles";
import { BrowserWindow, Menu, app, screen } from "electron";

(async () => {
  await api.startServer();

  registerHandles();
  Menu.setApplicationMenu(null);
  app.setName("com.painfuego.muzzic");
  app.setAppUserModelId("com.painfuego.muzzic");

  const preload = path.resolve(__dirname, "./preload.js");

  app.once("ready", async () => {
    const { width, height } = screen.getPrimaryDisplay().workArea;
    const win = new BrowserWindow({
      width,
      height,
      webPreferences: { backgroundThrottling: false, preload, contextIsolation: true, nodeIntegration: false },
    });
    win.webContents.openDevTools();
    !app.isPackaged ? win.loadURL("http://localhost:5173") : win.loadFile(path.join(__dirname, "../renderer/index.html"));
  });

  app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
})();
