/** @format */

import fs from "node:fs";
import axios from "axios";
import stream from "node:stream";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { bin, WIN32 } from "../constants";
import { safeAwait } from "../../shared/helpers";

const execute = promisify(exec);

export async function checkForBinary(name: string, cmd: string, K: keyof typeof bin) {
  const [res] = await safeAwait(execute(`${name} ${cmd}`));
  if (res) return !!(bin[K] = name);

  res;

  return await fs.promises
    .access(bin[K], fs.promises.constants.X_OK)
    .then(() => true)
    .catch(() => false);
}

export async function downloadBinary(url: string, destination: string) {
  return axios
    .get(url, { responseType: "stream" })
    .then(({ data }) => stream.promises.pipeline(data, fs.createWriteStream(destination)))
    .then(() => patch(destination));
}

export const patch = async (bin: string) => void (!WIN32 && (await execute(`chmod +x ${bin}`)));
