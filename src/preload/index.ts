import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getPort: () => ipcRenderer.invoke("getPort"),

  checkDLP: () => ipcRenderer.invoke("checkDLP"),
  downloadDLP: () => ipcRenderer.invoke("downloadDLP"),

  checkFFMPEG: () => ipcRenderer.invoke("checkFFMPEG"),
  downloadFFMPEG: () => ipcRenderer.invoke("downloadFFMPEG"),

  checkFFPROBE: () => ipcRenderer.invoke("checkFFPROBE"),
  downloadFFPROBE: () => ipcRenderer.invoke("downloadFFPROBE"),

  list: () => ipcRenderer.invoke("list"),
} satisfies Window["api"]);
