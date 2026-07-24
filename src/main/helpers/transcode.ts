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

  const res = await new Promise<string>((resolve) => {
    const args = ["-i", input, "-map", "0:a:0", "-map_metadata", "-1", "-map_chapters", "-1", "-c:a", format, out];
    child = spawn(bin.ffmpeg, args, { stdio: ["ignore", "ignore", "ignore"] });

    child.on("error", resolve);

    child.on("close", (code) =>
      code !== 0 ? resolve("") : resolve("file:///" + encodeURIComponent(out.replace(/\\/g, "/")).replace(/%2F/g, "/")),
    );
  });

  child?.kill("SIGKILL");
  const toRemove = last;
  toRemove && rm(toRemove, { force: true }).catch(() => setTimeout(() => rm(toRemove, { force: true }), 3000));
  last = out;
  return res;
}
