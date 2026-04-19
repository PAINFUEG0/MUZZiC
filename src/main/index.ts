import axios from "axios";
import * as fs from "node:fs";
import ffbinaries from "ffbinaries";
import { promisify } from "node:util";
import { exec } from "node:child_process";

process.env.DLP = "./bin/yt-dlp";
process.env.FFMPEG = "./bin/ffmpeg";
process.env.FFPROBE = "./bin/ffprobe";
export const WIN32 = process.platform === "win32";
export const YT_DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;

export const execute = promisify(exec);

fs.existsSync("./bin") || fs.mkdirSync("./bin");

if (!fs.existsSync(process.env.DLP))
  await fs.promises
    .writeFile(
      `${process.env.DLP}${!WIN32 || ".exe"}`,
      Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data),
    )
    .then(async () => void (!WIN32 && (await execute(`chmod +x ${process.env.DLP}`))));

if (!fs.existsSync(process.env.FFMPEG) || !fs.existsSync(process.env.FFPROBE))
  await new Promise((resolve, reject) =>
    ffbinaries.downloadBinaries(["ffmpeg", "ffprobe"], { destination: "./bin" }, (err, data) =>
      err ? reject(err) : resolve(data),
    ),
  );

await import("./source.test.js");
