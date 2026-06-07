import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getPort: () => ipcRenderer.invoke("getPort"),

  checkDLP: () => ipcRenderer.invoke("checkDLP"),
  downloadDLP: () => ipcRenderer.invoke("downloadDLP"),

  checkFFMPEG: () => ipcRenderer.invoke("checkFFMPEG"),
  downloadFFMPEG: () => ipcRenderer.invoke("downloadFFMPEG"),

  checkFFPROBE: () => ipcRenderer.invoke("checkFFPROBE"),
  downloadFFPROBE: () => ipcRenderer.invoke("downloadFFPROBE"),

  getMediaFolder: () => ipcRenderer.invoke("getMediaFolder"),
  setMediaFolder: (dir) => ipcRenderer.invoke("setMediaFolder", dir),

  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),

  scan: (dir: string) => ipcRenderer.invoke("scan", dir),

  getTree: (K) => ipcRenderer.invoke("getTree", K),
  setTree: (K, V) => ipcRenderer.invoke("setTree", K, V),

  extractMetadata: (flat) => ipcRenderer.invoke("extractMetadata", flat),

  getMeta: (K) => ipcRenderer.invoke("getMeta", K),
  setMeta: (K, V) => ipcRenderer.invoke("setMeta", K, V),
  deleteMeta: (K) => ipcRenderer.invoke("deleteMeta", K),
} satisfies Window["api"]);
