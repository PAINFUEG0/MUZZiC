import * as plugins from "../../plugins/index";
import { DirNode } from "../../shared/types/utils";
import { api } from "./server";

let initiated = false;
let tree = {} as DirNode<true>;
const dir = "D:/projects/amdl/downloads/lithe";
export const plugin = new plugins.LocalResourceProvider();

export async function registerLocalFilePlugin() {
  await plugin.init();
  api.broadcast({ op: "status", data: `Scanning ${dir} . . .` });
  const scanned = await plugin.scan(dir);
  api.broadcast({ op: "status", data: "Fingerprinting files . . ." });
  tree = await plugin.finger(scanned!);
  api.broadcast({ op: "status", data: "Probing files . . ." });
  await plugin.probe(tree);
  initiated = true;
  api.broadcast({ op: "status", data: "Complete" });
}

export async function getLocalFileList() {
  if (!initiated) await registerLocalFilePlugin();
  return plugin.list(tree, "track");
}
