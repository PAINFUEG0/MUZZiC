import * as plugins from "../../plugins/index";
import { DirNode } from "../../shared/types/utils";

let initiated = false;
let tree = {} as DirNode<true>;
// const dir = "D:/music/old";
const dir = "D:/projects/amdl/downloads/lithe";
export const plugin = new plugins.LocalResourceProvider();

export async function registerLocalFilePlugin() {
  await plugin.init();
  tree = await plugin.finger((await plugin.scan(dir))!);
  await plugin.probe(tree);
  initiated = true;
}

export async function getLocalFileList() {
  if (!initiated) await registerLocalFilePlugin();
  return plugin.list(tree, "track");
}
