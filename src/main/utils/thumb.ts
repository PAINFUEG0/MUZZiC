/** @format */

import path from "node:path";
import { spawn } from "node:child_process";
import { bin, directories } from "../constants";

export async function thumb(source: string, id: string) {
  return new Promise<void>((resolve) => {
    const scaled = path.resolve(directories.thumbnails, `thumbnail.${id}.jpg`);
    const original = path.resolve(directories.thumbnails, `artwork.${id}.jpg`);

    const T = ["-frames:v", "1", "-q:v", "2", "-y"];
    const args = ["-i", source, "-an", ...T, original, "-vf", `scale=${240}:-1`, ...T, scaled];

    spawn(bin.ffmpeg.path, args, { stdio: "ignore" }).on("error", resolve).on("close", resolve);
  });
}
