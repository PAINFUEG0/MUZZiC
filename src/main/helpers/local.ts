import fs from "node:fs";
import path from "node:path";
import { chunk } from "../../shared/helpers";
import { settings, tree } from "../database";
import { DirNode } from "../../shared/types/utils";
import { AUDIO_EXTENSIONS } from "../../shared/constants";
import { api } from "./server";

export async function setMediaFolder(dir: string) {
  settings.set("mediaFolder", dir);
}

export async function getMediaFolder() {
  return settings.get("mediaFolder") as string | null;
}

export async function getMediaFilesTree() {
  if (!tree.get("local")) {
    const mediaFolder = (await getMediaFolder())!;

    const scanned = await scanMediaFolder(mediaFolder);
    if (!scanned) return { dirs: [], files: [], name: path.basename(mediaFolder), path: mediaFolder };

    const fingerprinted = await fingerprintMediaFiles(scanned);
    tree.set("local", fingerprinted);
  }

  return tree.get("local") as DirNode<true>;
}

export async function scanMediaFolder(dir: string) {
  const name = path.basename(dir);
  if (name.startsWith(".")) return;
  const node: DirNode = { name, path: dir, files: [], dirs: [] };
  const entries = (await fs.promises.readdir(dir, { withFileTypes: true })).filter((e) => !e.name.startsWith("."));

  node.files = entries
    .filter((e) => e.isFile() && AUDIO_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => ({ name: e.name, path: path.resolve(dir, e.name) }));

  for (const directory of entries.filter((e) => e.isDirectory())) {
    api.broadcast({ type: "INFO_POPUP", data: "Scanning " + directory.name });
    const child = await scanMediaFolder(path.resolve(dir, directory.name));
    child && node.dirs.push(child);
  }

  if (node.files.length || node.dirs.length) return node;
}

export async function fingerprintMediaFiles(tree: DirNode<false>): Promise<DirNode<true>> {
  const promises: (() => Promise<void>)[] = [];

  function traverse(node: DirNode<false>) {
    for (const file of node.files)
      //@ts-ignore assigning prop
      promises.push(async () => await fs.promises.stat(file.path).then((s) => void (file.id = s.ino.toString())));
    for (const dir of node.dirs) {
      api.broadcast({ type: "INFO_POPUP", data: "Fingerprinting " + dir.name });
      traverse(dir);
    }
  }

  traverse(tree);
  for (const promiseChunk of chunk(promises, 100)) await Promise.all(promiseChunk.map((fn) => fn()));
  return tree as unknown as DirNode<true>;
}
