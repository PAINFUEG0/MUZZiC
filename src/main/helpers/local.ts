/** @format */

import path from "node:path";
import { api } from "../server";
import { probe } from "../utils/probe";
import { thumb } from "../utils/thumb";
import { tree, meta } from "../database";
import { File } from "../../shared/types/utils";
import { Semaphore } from "../utils/sepmaphore";
import { scanMediaFolder } from "../utils/scan";
import { DirNode } from "../../shared/types/utils";
import { Track } from "../../shared/types/sourcePlugin";

const sem = new Semaphore(8);

export async function getTree(K: string) {
  return tree.get(K);
}

export async function setTree(K: string, V: DirNode) {
  return tree.set(K, V);
}

export async function setMeta<T extends [string, Track] | [{ key: string; value: Track }[]], R extends ReturnType<(typeof meta)["set"]>>(
  ...args: T
): Promise<T extends [string, Track] ? R : R[]> {
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
  return (await scanMediaFolder(dir)) || { dirs: [], files: [], name: path.basename(dir), path: dir };
}

export async function extractMetadata(flat: File[]) {
  let count = 1;
  const results = await Promise.all(
    flat.map((file) =>
      sem.run(() =>
        Promise.all([probe(file), thumb(file.path, `./.thumbnails/${file.id}.jpg`).catch(() => null)]).then(([meta]) => {
          api.broadcast({ type: "PROGRESS", data: "PROBE", current: count++, total: flat.length });
          return { key: file.id, value: meta };
        }),
      ),
    ),
  );
  return results;
}
