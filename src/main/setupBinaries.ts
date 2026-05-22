import axios from "axios";
import * as fs from "node:fs";
import ffbinaries from "ffbinaries";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { FFMPEG, FFPROBE, DLP } from "../shared/constants";

const execute = promisify(exec);
const WIN32 = process.platform === "win32";
const YT_DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;

export async function setupBinaries() {
  fs.existsSync("./bin") || fs.mkdirSync("./bin");

  if (!fs.existsSync(DLP))
    await fs.promises
      .writeFile(DLP, Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data))
      .then(async () => !WIN32 && (await execute(`chmod +x ${DLP}`)));

  if (!fs.existsSync(FFMPEG)) await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: "./bin" }))();

  if (!fs.existsSync(FFPROBE)) await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: "./bin" }))();
}
