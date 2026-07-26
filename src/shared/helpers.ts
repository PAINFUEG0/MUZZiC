/** @format */

import { DirNode, Tree } from "./types";

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function hexToRgba(hex: string, opacity: number) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

export function gainToDb(gain: number): number {
  if (gain <= 0) return -Infinity;
  return 20 * Math.log10(gain);
}

export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}
