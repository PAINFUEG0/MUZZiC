import axios from "axios";
import * as fs from "node:fs";
import { api } from "./server";
import ffbinaries from "ffbinaries";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { DLP, FFMPEG, FFPROBE, WIN32, YT_DLP_BIN_URL } from "../../shared/constants";

const execute = promisify(exec);

export async function ensureBinaries() {
  fs.existsSync("./bin") || fs.mkdirSync("./bin");

  const promises = <(() => Promise<any>)[]>[];

  if (!fs.existsSync(DLP))
    promises.push(async () =>
      fs.promises
        .writeFile(DLP, Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data))
        .then(async () => !WIN32 && (await execute(`chmod +x ${DLP}`))),
    );

  if (!fs.existsSync(FFPROBE))
    promises.push(promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: "./bin" })));

  if (!fs.existsSync(FFMPEG)) promises.push(promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: "./bin" })));

  if (!promises.length) return api.broadcast({ type: "SUCCESS_POPUP", data: "Binary validation successful" });

  const start = performance.now();
  api.broadcast({ type: "WARNING_POPUP", data: `Found ${promises.length} missing binaries, downloading...` });
  await Promise.all(promises.map((p) => p()));
  api.broadcast({ type: "SUCCESS_POPUP", data: `Binary validation successful [${((performance.now() - start) / 1000).toFixed(2)}s]` });
}
