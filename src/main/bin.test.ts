import axios from "axios";
import * as fs from "node:fs";
import ffbinaries from "ffbinaries";
import { Writer } from "./writer.js";
import { promisify } from "node:util";
import { exec } from "node:child_process";

const writer = new Writer();
const execute = promisify(exec);
const WIN32 = process.platform === "win32";
process.env.DLP = `./bin/yt-dlp${WIN32 ? ".exe" : ""}`;
process.env.FFMPEG = `./bin/ffmpeg${WIN32 ? ".exe" : ""}`;
process.env.FFPROBE = `./bin/ffprobe${WIN32 ? ".exe" : ""}`;
const YT_DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;

fs.existsSync("./bin") || fs.mkdirSync("./bin");

await validate(process.env.DLP, async () =>
  fs.promises
    .writeFile(process.env.DLP!, Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data))
    .then(async () => (!WIN32 && (await execute(`chmod +x ${process.env.DLP}`)), true))
    .catch(() => false),
);

await validate(process.env.FFMPEG, () =>
  promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: "./bin" }))()
    .then(() => true)
    .catch(() => false),
);
await validate(process.env.FFPROBE, () =>
  promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: "./bin" }))()
    .then(() => true)
    .catch(() => false),
);

writer.end();

async function validate(bin: string, download: () => Promise<boolean>) {
  writer.write(`Checking for ${bin}`);
  if (!fs.existsSync(bin)) {
    writer.update(`Missing ${bin}, downloading . . .`);
    const res = await download();
    if (res) writer.update(`${bin} downloaded`);
    else writer.update(`Failed to download ${bin}`);
  }
  writer.update(`PASS : ${bin}`);
}
