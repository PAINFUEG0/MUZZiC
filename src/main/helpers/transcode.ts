/** @format */

import path from "node:path";
import { rm } from "node:fs/promises";
import { spawn } from "child_process";
import { randomUUID } from "node:crypto";
import { getPcmFormat } from "./settings";
import { directories, bin } from "../constants";
import type { ChildProcessByStdio } from "node:child_process";

let last = "";
let child: ChildProcessByStdio<null, null, null> | undefined;

export async function transcode(input: string) {
  child?.kill("SIGTERM");

  const format = await getPcmFormat();
  const out = path.resolve(directories.temp, `${randomUUID()}.wav`);

  const res = new Promise<string>((resolve, reject) => {
    const args = ["-i", input, "-map", "0:a:0", "-map_metadata", "-1", "-map_chapters", "-1", "-c:a", format, out];
    child = spawn(bin.ffmpeg, args, { stdio: ["ignore", "ignore", "ignore"] });

    child.on("error", () => {
      child?.kill("SIGTERM");
    });

    child.on("close", (code) => {
      child?.kill("SIGTERM");
      code !== 0
        ? reject(new Error(`ffmpeg exited with code ${code}`))
        : resolve("file:///" + encodeURIComponent(out.replace(/\\/g, "/")).replace(/%2F/g, "/"));
    });
  });

  last && (await rm(last, { force: true }).catch(() => null));
  last = out;
  return res;
}
