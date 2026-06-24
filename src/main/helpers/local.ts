/** @format */

import path from "node:path";
import { api } from "../server";
import { probe } from "../utils/probe";
import { thumb } from "../utils/thumb";
import { tree, meta } from "../database";
import { API, File } from "../../shared/types";
import { Semaphore } from "../utils/sepmaphore";
import { scanMediaFolder } from "../utils/scan";

const sem = new Semaphore(8);

export const getTree: API["getTree"] = async (K) => tree.get(K);
export const setTree: API["setTree"] = async (K, V) => tree.set(K, V);

export const scan: API["scan"] = async (dir) =>
  (await scanMediaFolder(dir)) || { dirs: [], files: [], name: path.basename(dir), path: dir };

export const extractMetadata: API["extractMetadata"] = async (flat: File[]) => {
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
};

export const setMeta: API["setMeta"] = async (...args) =>
  (Array.isArray(args[0]) ? meta.setMany(args[0]) : meta.set(args[0], args[1]!)) as any;
export const getMeta: API["getMeta"] = async (K) => (Array.isArray(K) ? meta.getMany(K) : meta.get(K)) as any;
export const deleteMeta: API["deleteMeta"] = async (K) => (Array.isArray(K) ? meta.deleteMany(K) : meta.delete(K)) as any;
