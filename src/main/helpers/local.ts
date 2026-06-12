import { api } from "../server";
import path from "node:path";
import { thumb } from "../utils/thumb";
import { probe } from "../utils/probe";
import { tree, meta } from "../database";
import { transform } from "../utils/transform";
import { scanMediaFolder } from "../utils/scan";
import { File } from "../../shared/types/utils";
import { Semaphore } from "../utils/sepmaphore";
import { DirNode } from "../../shared/types/utils";
import { Track } from "../../shared/types/sourcePlugin";
import { fingerprintMediaFiles } from "../utils/finger";

const sem = new Semaphore(16);

export async function getTree(K: string) {
  return tree.get(K);
}

export async function setTree(K: string, V: DirNode<true>) {
  return tree.set(K, V);
}

export async function setMeta<
  T extends [string, Track<true>] | [{ key: string; value: Track<true> }[]],
  R extends ReturnType<(typeof meta)["set"]>,
>(...args: T): Promise<T extends [string, Track<true>] ? R : R[]> {
  return (Array.isArray(args[0]) ? meta.setMany(args[0]) : meta.set(args[0], args[1]!)) as any;
}

export async function getMeta<T extends string | string[], R extends ReturnType<(typeof meta)["get"]>>(
  K: T,
): Promise<T extends string ? R : R[]> {
  return (Array.isArray(K) ? meta.getMany(K) : meta.get(K)) as any;
}

export async function deleteMeta<T extends string | string[], R extends ReturnType<(typeof meta)["delete"]>>(
  K: T,
): Promise<T extends string ? R : R[]> {
  return (Array.isArray(K) ? meta.deleteMany(K) : meta.delete(K)) as any;
}

export async function scan(dir: string) {
  const scanned = await scanMediaFolder(dir);
  if (!scanned) return { dirs: [], files: [], name: path.basename(dir), path: dir };

  const fingerprinted = await fingerprintMediaFiles(scanned);
  return fingerprinted;
}

export async function extractMetadata(flat: File<true>[]) {
  let count = 1;
  const results = await Promise.all(
    flat.map((file) =>
      sem.run(() =>
        probe(file.path).then((meta) => {
          api.broadcast({ type: "PROGRESS", data: "PROBE", current: count++, total: flat.length });
          return { key: file.id, value: transform(file, meta) };
        }),
      ),
    ),
  );
  return results;
}

export async function extractThumbnail(flat: File<true>[]) {
  let count = 1;
  const results = await Promise.all(
    flat.map((file) =>
      sem.run(() =>
        thumb(file.path, `${file.id}.jpg`)
          .then(() => ({ id: file.id, thumbnail: `${file.id}.jpg` }))
          .catch(() => ({ id: file.id, thumbnail: null }))
          .finally(() => api.broadcast({ type: "PROGRESS", data: "THUMB", current: count++, total: flat.length })),
      ),
    ),
  );
  return results;
}
