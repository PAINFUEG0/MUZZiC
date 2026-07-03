/** @format */

import path from "node:path";
import { rm } from "node:fs/promises";
import { spawn } from "child_process";
import { randomUUID } from "node:crypto";
import { directories, FFMPEG } from "../constants";

let last = "";

export async function transcode(input: string) {
  const out = path.resolve(directories.thumbnails, `${randomUUID()}.wav`);

  const res = new Promise<string>((resolve, reject) => {
    const args = ["-i", input, "-map", "0:a:0", "-map_metadata", "-1", "-map_chapters", "-1", "-c:a", "pcm_s16le", out];
    const child = spawn(FFMPEG, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";

    child.on("error", reject);

    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));

    child.on("close", (code) =>
      code !== 0
        ? reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`))
        : resolve("file:///" + encodeURIComponent(out.replace(/\\/g, "/")).replace(/%2F/g, "/")),
    );
  });

  last && (await rm(last, { force: true }).catch(() => null));
  last = out;
  return res;
}
