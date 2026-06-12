import * as fs from "node:fs";
import * as path from "node:path";
import { DirNode } from "../../shared/types/utils";
import { AUDIO_EXTENSIONS } from "../../shared/constants";

export async function scanMediaFolder(dir: string) {
  const name = path.basename(dir);
  if (name.startsWith(".")) return;
  const node: DirNode = { name, path: dir, files: [], dirs: [] };
  const entries = (await fs.promises.readdir(dir, { withFileTypes: true })).filter((e) => !e.name.startsWith("."));

  node.files = entries
    .filter((e) => e.isFile() && AUDIO_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => ({ name: e.name, path: path.resolve(dir, e.name) }));

  for (const directory of entries.filter((e) => e.isDirectory())) {
    const child = await scanMediaFolder(path.resolve(dir, directory.name));
    child && node.dirs.push(child);
  }

  if (node.files.length || node.dirs.length) return node;
}
