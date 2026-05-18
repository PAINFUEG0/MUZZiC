import axios from "axios";
import * as fs from "node:fs";
import ffbinaries from "ffbinaries";
import { promisify } from "node:util";
import { exec } from "node:child_process";

const execute = promisify(exec);
const WIN32 = process.platform === "win32";
process.env.DLP = `./bin/yt-dlp${WIN32 ? ".exe" : ""}`;
process.env.FFMPEG = `./bin/ffmpeg${WIN32 ? ".exe" : ""}`;
process.env.FFPROBE = `./bin/ffprobe${WIN32 ? ".exe" : ""}`;
const YT_DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;

fs.existsSync("./bin") || fs.mkdirSync("./bin");

console.log("Checking for yt-dlp binary");
if (!fs.existsSync(process.env.DLP)) {
  console.log("Missing yt-dlp binary, downloading . . .");
  await fs.promises
    .writeFile(`${process.env.DLP}${!WIN32 || ".exe"}`, Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data))
    .then(async () => (console.log("yt-dlp binary downloaded"), !WIN32 && (await execute(`chmod +x ${process.env.DLP}`))))
    .catch(() => console.log("Failed to download yt-dlp binary"));
} else console.log("PASS : Found yt-dlp binary");

console.log("Checking for ffmpeg binary");
if (!fs.existsSync(process.env.FFMPEG)) {
  console.log("Missing ffmpeg binary, downloading . . .");
  await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: "./bin" }))()
    .then(() => console.log("ffmpeg binary downloaded"))
    .catch(() => console.log("Failed to download ffmpeg binary"));
} else console.log("PASS : Found ffmpeg binary");

console.log("Checking for ffprobe binary");
if (!fs.existsSync(process.env.FFPROBE)) {
  console.log("Missing ffmpeg binary, downloading . . .");
  await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: "./bin" }))()
    .then(() => console.log("ffprobe binary downloaded"))
    .catch(() => console.log("Failed to download ffprobe binary"));
} else console.log("PASS : Found ffprobe binary");

await import("./local.test.js");
