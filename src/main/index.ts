/** @format */

process.env.UV_THREADPOOL_SIZE = "64";

(async () => {
  const path = await import("node:path");
  const { api } = await import("./server.js");
  const { BrowserWindow, app } = await import("electron");
  const { registerHandles } = await import("./handles.js");
  const { appUserModelId } = (await import("../../package.json")).default;

  await api.startServer();

  app.setName(appUserModelId);
  app.setAppUserModelId(appUserModelId);
  const preload = path.resolve(__dirname, "./preload.js");
  const webPreferences = { webSecurity: false, backgroundThrottling: false, preload } as Electron.WebPreferences;

  app.once("ready", async () => {
    const win = new BrowserWindow({ frame: false, show: false, webPreferences, minHeight: 600, minWidth: Math.round(600 * (1280 / 720)) });

    registerHandles(win);

    !app.isPackaged
      ? win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
      : win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));

    win.once("ready-to-show", () => (win.maximize(), win.show()));
  });

  app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
})();
