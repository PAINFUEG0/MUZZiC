import * as path from "node:path";
import { BrowserWindow, app, screen } from "electron";

app.setName("com.painfuego.music");
app.setAppUserModelId("com.painfuego.music");

const preload = path.resolve(import.meta.dirname, "./preload.cjs");

app.once("ready", async () => {
  const { width, height } = screen.getPrimaryDisplay().workArea;
  const win = new BrowserWindow({ width, height, webPreferences: { backgroundThrottling: false, preload, nodeIntegration: true } });
  return !app.isPackaged ? win.loadURL("http://localhost:5173") : win.loadFile(path.join(__dirname, "../renderer/renderer/index.html"));
});

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
