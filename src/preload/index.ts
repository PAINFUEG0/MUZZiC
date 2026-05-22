import { readdirSync } from "node:fs";
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  list: () => readdirSync("."),
});
