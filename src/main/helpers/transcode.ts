/** @format */

import fs from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { spawn } from "child_process";
import { settings } from "../database";
import { randomUUID } from "node:crypto";
import { directories, bin } from "../constants";
import { ChildProcessByStdio } from "node:child_process";

let transcoded: string[] = [];
let child: ChildProcessByStdio<null, null, null> | undefined;

export async function transcode(input: string) {
  if (child && !child.killed) child.kill("SIGKILL");

  const out = path.resolve(directories.temp, `${randomUUID()}.wav`);
  const format = (settings.get("pcmFormat") || "pcm_s16le") as string;

  transcoded.push(out);

  const args = ["-i", input, "-map", "0:a:0", "-map_metadata", "-1", "-map_chapters", "-1", "-c:a", format, out];
  const proc = spawn(bin.ffmpeg.path, args, { stdio: ["ignore", "ignore", "ignore"] });
  child = proc;

  const result = await Promise.race([once(proc, "close").then(() => proc.exitCode), once(proc, "error").then(() => "X")]);

  if (result !== 0) return "";
  return "file:///" + encodeURIComponent(out.replace(/\\/g, "/")).replace(/%2F/g, "/");
}

setInterval(async () => {
  for (let i = 0; i < transcoded.length - 1; i++)
    await fs.promises
      .rm(transcoded[i]!, { force: true })
      .then(() => (transcoded[i] = ""))
      .catch(() => null);

  transcoded = transcoded.filter((t) => !!t);
}, 10_000);
