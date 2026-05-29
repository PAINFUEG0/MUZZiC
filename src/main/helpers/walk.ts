import * as fs from "node:fs";
import * as path from "node:path";
import { DirNode } from "../../shared/types/utils.js";
import { AUDIO_EXTENSIONS } from "../../shared/constants.js";

export async function walk(entrypoint: string) {
  const name = path.basename(entrypoint);

  if (name.startsWith(".")) return null;

  const entries = (await fs.promises.readdir(entrypoint, { withFileTypes: true })).filter((e) => !e.name.startsWith("."));

  const node: DirNode = { name, path: entrypoint, files: [], dirs: [] };

  const directories = entries.filter((e) => e.isDirectory());
  const files = entries.filter((e) => e.isFile() && AUDIO_EXTENSIONS.has(path.extname(e.name).toLowerCase()));

  node.files = files.map((e) => ({ name: e.name, path: path.resolve(entrypoint, e.name) }));

  for (const directory of directories) {
    const child = await walk(path.resolve(entrypoint, directory.name));
    if (child) node.dirs.push(child);
  }

  return node.files.length || node.dirs.length ? node : null;
}
