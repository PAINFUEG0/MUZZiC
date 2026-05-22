import * as path from "node:path";
import { registerHandlers } from "./handlers";
import { BrowserWindow, Menu, app, screen } from "electron";

registerHandlers();
Menu.setApplicationMenu(null);
app.setName("com.painfuego.muzzic");
app.setAppUserModelId("com.painfuego.muzzic");

const preload = path.resolve(__dirname, "./preload.js");

app.once("ready", async () => {
  const { width, height } = screen.getPrimaryDisplay().workArea;
  const win = new BrowserWindow({ width, height, webPreferences: { backgroundThrottling: false, preload, devTools: true } });
  !app.isPackaged ? win.loadURL("http://localhost:5173") : win.loadFile(path.join(__dirname, "../renderer/index.html"));
  win.webContents.openDevTools();
});

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
