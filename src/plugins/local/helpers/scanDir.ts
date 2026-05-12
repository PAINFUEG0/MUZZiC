import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { DirNode } from "../../../shared/types/utils.js";
import { AUDIO_EXTENSIONS } from "../../../shared/constants.js";

export async function scanAudioDir(dir: string) {
  const name = path.basename(dir);

  if (name.startsWith(".")) return null;

  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith("."));

  const node: DirNode = { name, path: dir, files: [], dirs: [] };

  await Promise.all(
    entries
      .filter((e) => e.isFile() && AUDIO_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
      .map(async (e) => {
        const id = await generateId(path.resolve(dir, e.name));
        node.files.push({ name: e.name, path: path.resolve(dir, e.name), id });
      }),
  );

  await Promise.all(
    entries
      .filter((e) => e.isDirectory())
      .map(async (e) => {
        const child = await scanAudioDir(path.resolve(dir, e.name));
        if (child) (node.dirs ||= []).push(child);
      }),
  );

  return node.files.length || node.dirs.length ? node : null;
}

async function generateId(fullPath: string): Promise<string> {
  const stat = await fs.promises.stat(fullPath);

  const chunkSize = 64 * 1024;
  const offset = Math.max(0, Math.floor(stat.size * 0.3));

  const fh = await fs.promises.open(fullPath, "r");
  const buf = Buffer.allocUnsafe(chunkSize);
  const { bytesRead } = await fh.read(buf, 0, chunkSize, offset);
  const id = createHash("sha1").update(buf.subarray(0, bytesRead)).update(String(stat.size)).digest("hex");
  await fh.close();
  return id;
}
