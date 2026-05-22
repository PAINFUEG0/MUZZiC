import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  list: () => ipcRenderer.invoke("list"),
  ensureBinaries: () => ipcRenderer.invoke("ensureBinaries"),
});
