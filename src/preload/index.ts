/** @format */

import { API } from "../../global";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld(
  "api",
  Object.fromEntries(
    (
      [
        "close",
        "minimize",
        "fullscreen",
        "getPort",
        "checkDLP",
        "downloadDLP",
        "checkFFMPEG",
        "downloadFFMPEG",
        "checkFFPROBE",
        "downloadFFPROBE",
        "getMediaFolder",
        "setMediaFolder",
        "openFolderDialog",
        "scan",
        "getTree",
        "setTree",
        "extractMetadata",
        "getMeta",
        "deleteMeta",
        "setMeta",
      ] satisfies (keyof API)[]
    ).map((K) => [K, (...args: any[]) => ipcRenderer.invoke(K, ...args)]),
  ),
);
