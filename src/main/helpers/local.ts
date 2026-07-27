/** @format */

import fs from "node:fs";
import path from "node:path";
import { api } from "../server";
import { thumb } from "../utils/thumb";
import { tree, meta } from "../database";
import { directories } from "../constants";
import { metadata } from "../utils/metadata";
import { API, File } from "../../shared/types";
import { Semaphore } from "../utils/semaphore";
import { scanMediaFolder } from "../utils/scan";

const sem = new Semaphore(8);

export const getTree: API["getTree"] = async (K) => tree.get(K);
export const setTree: API["setTree"] = async (K, V) => tree.set(K, V);
export const deleteTree: API["deleteTree"] = async (K) => tree.delete(K);

export const scan: API["scan"] = async (dir) =>
  (await scanMediaFolder(dir)) || { dirs: [], files: [], name: path.basename(dir), path: dir };

export const extractAndSaveMetadata: API["extractAndSaveMetadata"] = async (flat: File[]) => {
  let count = 1;
  return await Promise.all(
    flat.map((file) =>
      sem.run(() =>
        Promise.all([metadata(file), thumb(file.path, file.id).catch(() => null)]).then(async ([meta]) => {
          api.broadcast({ type: "PROGRESS", data: "PROBE", current: count++, total: flat.length });
          return (await setMeta(file.id, meta), { key: file.id, value: meta });
        }),
      ),
    ),
  );
};

export const deleteThumbnails = async (ids: string[]) => {
  for (const id of ids)
    await Promise.all([
      fs.promises.rm(path.resolve(directories.thumbnails, `artwork.${id}.jpg`), { force: true }).catch(() => null),
      fs.promises.rm(path.resolve(directories.thumbnails, `thumbnail.${id}.jpg`), { force: true }).catch(() => null),
    ]);
};

export const getAllMeta: API["getAllMeta"] = async () => meta.all();
export const setMeta: API["setMeta"] = async (...args) =>
  (Array.isArray(args[0]) ? meta.setMany(args[0]) : meta.set(args[0], args[1]!)) as any;
export const getMeta: API["getMeta"] = async (K) => (Array.isArray(K) ? meta.getMany(K) : meta.get(K)) as any;
export const deleteMeta: API["deleteMeta"] = async (K) => (Array.isArray(K) ? meta.deleteMany(K) : meta.delete(K)) as any;
