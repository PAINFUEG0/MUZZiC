/** @format */

import fs from "node:fs";
import axios from "axios";
import stream from "node:stream";
import { promisify } from "node:util";
import { once } from "node:events";
import { exec, spawn } from "node:child_process";
import { WIN32, bin as Bin } from "../constants.js";

import type { AxiosProgressEvent } from "axios";

const execute = promisify(exec);

const checkBinary = async (cmd: string, ...args: string[]) => {
  const controller = new AbortController();
  try {
    const child = spawn(cmd, args, { shell: false, timeout: 1000 });
    const valid = await Promise.race([
      once(child, "error", { signal: controller.signal }).then(() => false),
      once(child, "close", { signal: controller.signal }).then(() => true),
      once(child.stderr, "data", { signal: controller.signal }).then(() => false),
    ]);
    if (!child.killed) child.kill("SIGKILL");
    return valid;
  } catch {
    return false;
  } finally {
    controller.abort();
  }
};

export async function checkForBinary(cmd: string, bin: keyof typeof Bin, ...args: string[]) {
  let valid = await checkBinary(cmd, ...args);
  if (valid) return ((Bin[bin] = cmd), true);
  valid = await checkBinary(Bin[bin], ...args);
  return valid;
}

export async function downloadBinary(url: string, destination: string, onProgress?: (e: AxiosProgressEvent) => void) {
  await axios
    .get(url, {
      responseType: "stream",
      onDownloadProgress: onProgress,
    })
    .then(({ data }) => stream.promises.pipeline(data, fs.createWriteStream(destination)))
    .then(() => patch(destination));
}

export const patch = async (bin: string) => void (!WIN32 && (await execute(`chmod +x ${bin}`)));
