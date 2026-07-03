/** @format */

import { DirNode, Tree } from "./types";

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function flatten(node: Tree): Tree["files"];
export function flatten(node: DirNode): DirNode["files"];
export function flatten(node: DirNode | Tree) {
  return [...node.files, ...node.dirs.flatMap((_) => flatten(_))];
}

export async function safeAwait<T, E extends Error>(promiseLike: Promise<T>) {
  try {
    const result = await promiseLike;
    return [result, undefined] as [T, undefined];
  } catch (error) {
    return [undefined, error] as [undefined, E];
  }
}

export function chunk<T>(arr: T[], size: number) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, (i + 1) * size));
}
