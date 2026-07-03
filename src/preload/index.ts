/** @format */

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("invoke", ipcRenderer.invoke.bind(ipcRenderer));
