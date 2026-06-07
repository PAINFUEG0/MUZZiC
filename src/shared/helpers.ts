import { DirNode } from "./types/utils";

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

export function flatten<T extends boolean>(node: DirNode<T>): DirNode<T>["files"] {
  if (!node) return [];
  return [...node.files, ...node.dirs.flatMap((e) => flatten(e))];
}
