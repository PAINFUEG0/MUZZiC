import * as path from "node:path";
import { api } from "./helpers/server";
import { registerHandles } from "./handles";
import { BrowserWindow, Menu, app, screen } from "electron";

(async () => {
  await api.startServer();

  registerHandles();

  Menu.setApplicationMenu(null);
  app.disableHardwareAcceleration();
  app.setName("com.painfuego.muzzic");
  app.commandLine.appendSwitch("disable-gpu");
  app.setAppUserModelId("com.painfuego.muzzic");
  app.commandLine.appendSwitch("disable-gpu-compositing");
  app.commandLine.appendSwitch("disable-software-rasterizer");
  app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

  const preload = path.resolve(__dirname, "./preload.js");

  app.once("ready", async () => {
    const { width, height } = screen.getPrimaryDisplay().workArea;
    const win = new BrowserWindow({ width, height, webPreferences: { backgroundThrottling: false, preload } });
    win.webContents.openDevTools();
    !app.isPackaged ? win.loadURL("http://localhost:5173") : win.loadFile(path.join(__dirname, "../renderer/index.html"));
  });

  app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
})();
