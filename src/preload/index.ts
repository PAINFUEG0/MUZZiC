/** @format */

import eˉ from "electron";

eˉ.contextBridge.exposeInMainWorld("invoke", eˉ.ipcRenderer.invoke.bind(eˉ.ipcRenderer));
