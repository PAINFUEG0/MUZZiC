/** @format */

process.env.UV_THREADPOOL_SIZE = "64";

(async () => {
  const path = await import("node:path");
  const { api } = await import("./server.js");
  const { BrowserWindow, app } = await import("electron");
  const { registerHandles } = await import("./handles.js");
  const { appUserModelId } = (await import("../../package.json")).default;

  await api.startServer();

  registerHandles();

  app.setName(appUserModelId);
  app.setAppUserModelId(appUserModelId);
  const preload = path.resolve(__dirname, "./preload.js");

  app.once("ready", async () => {
    const win = new BrowserWindow({ show: false, webPreferences: { webSecurity: false, backgroundThrottling: false, preload } });
    !app.isPackaged
      ? win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
      : win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    win.once("ready-to-show", () => (win.maximize(), win.show(), win.focus));
  });

  app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
})();
