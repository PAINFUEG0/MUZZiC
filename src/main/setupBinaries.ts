import axios from "axios";
import * as fs from "node:fs";
import ffbinaries from "ffbinaries";
import { promisify } from "node:util";
import { exec } from "node:child_process";

const execute = promisify(exec);
const WIN32 = process.platform === "win32";
const YT_DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;

export async function setupBinaries() {
  process.env.DLP = WIN32 ? "./bin/yt-dlp.exe" : "./bin/yt-dlp";
  process.env.FFMPEG = WIN32 ? "./bin/ffmpeg.exe" : "./bin/ffmpeg";
  process.env.FFPROBE = WIN32 ? "./bin/ffprobe.exe" : "./bin/ffprobe";

  fs.existsSync("./bin") || fs.mkdirSync("./bin");

  if (!fs.existsSync(process.env.FFMPEG))
    await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: "./bin" }))();

  if (!fs.existsSync(process.env.FFPROBE))
    await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: "./bin" }))();

  if (!fs.existsSync(process.env.DLP))
    await fs.promises
      .writeFile(process.env.DLP!, Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data))
      .then(async () => !WIN32 && (await execute(`chmod +x ${process.env.DLP}`)));
}
