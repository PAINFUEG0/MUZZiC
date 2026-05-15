import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { chunk } from "../../../shared/helpers.js";
import { DirNode } from "../../../shared/types/utils.js";
import { AUDIO_EXTENSIONS } from "../../../shared/constants.js";

export async function scanAudioDir(entrypoint: string) {
  const name = path.basename(entrypoint);

  if (name.startsWith(".")) return null;

  const entries = (await fs.promises.readdir(entrypoint, { withFileTypes: true })).filter((e) => !e.name.startsWith("."));

  const node: DirNode = { name, path: entrypoint, files: [], dirs: [] };

  const directories = entries.filter((e) => e.isDirectory());
  const files = entries.filter((e) => e.isFile() && AUDIO_EXTENSIONS.has(path.extname(e.name).toLowerCase()));

  for (const fileChunk of chunk(files, 128))
    await Promise.all(
      fileChunk.map(async (e) => {
        const id = await generateId(path.resolve(entrypoint, e.name));
        node.files.push({ name: e.name, path: path.resolve(entrypoint, e.name), id });
      }),
    );

  for (const directory of directories) {
    const child = await scanAudioDir(path.resolve(entrypoint, directory.name));
    if (child) node.dirs.push(child);
  }

  return node.files.length || node.dirs.length ? node : null;
}

async function generateId(fullPath: string): Promise<string> {
  const fh = await fs.promises.open(fullPath, "r");
  const stat = await fh.stat();

  const chunkSize = 8 * 1024;
  const offset = Math.max(0, Math.floor(stat.size * 0.3));

  const buf = Buffer.allocUnsafe(chunkSize);
  const { bytesRead } = await fh.read(buf, 0, chunkSize, offset);
  const id = createHash("sha1").update(buf.subarray(0, bytesRead)).update(String(stat.size)).digest("hex");
  await fh.close();
  return id;
}
