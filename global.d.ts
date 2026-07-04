/** @format */

import eˉ from "electron";
import { API } from "./src/shared/types";

export {};

declare global {
  const MAIN_WINDOW_VITE_NAME: string;
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;

  interface Window {
    api: API;
    invoke: eˉ.IpcRenderer["invoke"];
  }
}
