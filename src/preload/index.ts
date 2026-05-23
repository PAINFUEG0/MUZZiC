import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  list: () => ipcRenderer.invoke("list"),
  getPort: () => ipcRenderer.invoke("getPort"),
  ensureBinaries: () => ipcRenderer.invoke("ensureBinaries"),
});
