import axios from "axios";
import * as fs from "node:fs";
import ffbinaries from "ffbinaries";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { DLP, FFMPEG, FFPROBE, WIN32, YT_DLP_BIN_URL } from "../../shared/constants";

const execute = promisify(exec);

fs.existsSync("./bin") || fs.mkdirSync("./bin");

export function checkDLP() {
  return fs.existsSync(DLP);
}

export function checkFFMPEG() {
  return fs.existsSync(FFMPEG);
}

export function checkFFPROBE() {
  return fs.existsSync(FFPROBE);
}

export async function downloadFFMPEG() {
  await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: "./bin" }))();
}

export async function downloadFFPROBE() {
  await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: "./bin" }))();
}

export async function downloadDLP() {
  await fs.promises.writeFile(DLP, Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data));
  if (!WIN32) await execute(`chmod +x ${DLP}`);
}
