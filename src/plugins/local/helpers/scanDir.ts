import * as fs from "fs";
import * as path from "path";
import { AUDIO_EXTENSIONS } from "../../../shared/constants.js";

type File = { path: string; name: string; ext: string; metadata: any };
type DirNode = { name: string; path: string; files: File[]; dirs: DirNode[] };

export function scanAudioDir(dir: string): DirNode | null {
  const name = path.basename(dir);

  if (name.startsWith(".")) return null;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const node: DirNode = { name, path: dir, files: [], dirs: [] };

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.resolve(dir, entry.name);

    if (entry.isDirectory()) {
      const child = scanAudioDir(fullPath);
      if (child) (node.dirs ||= []).push(child);
      continue;
    }

    if (entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      node.files.push({ metadata: {}, name: entry.name, path: fullPath, ext: path.extname(entry.name).toLowerCase() });
  }

  return node.files.length || Object.keys(node.dirs).length ? node : null;
}
