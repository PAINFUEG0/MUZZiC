/** @format */

import { bin } from "../constants";
import { spawn } from "node:child_process";

export async function thumb(source: string, dest: string) {
  return new Promise((resolve, reject) => {
    const args = ["-i", source, "-an", "-vf", `scale=${750}:-1`, "-frames:v", "1", "-q:v", "2", "-y", dest];

    let stdout = "";
    let stderr = "";
    const child = spawn(bin.ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });

    child.on("error", reject);
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("close", (code) => (code !== 0 ? reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`)) : resolve(stdout)));
  });
}
