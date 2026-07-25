/** @format */

import fs from "node:fs";
import axios from "axios";
import stream from "node:stream";
import { once } from "node:events";
import { promisify } from "node:util";
import { bin, WIN32 } from "../constants.js";
import { exec, spawn } from "node:child_process";

const execute = promisify(exec);

export const checkBinary = async (cmd: string, ...args: string[]) => {
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

export async function downloadBinary(_: (typeof bin)[keyof typeof bin], onProgress?: (e: axios.AxiosProgressEvent) => void) {
  await axios
    .get(_.remoteResourceURI, { responseType: "stream", onDownloadProgress: onProgress })
    .then(({ data }) => stream.promises.pipeline(data, fs.createWriteStream(_.path)))
    .then(async () => void (!WIN32 && (await execute(`chmod +x ${_.path}`))));
}
