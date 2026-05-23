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

  if (fs.existsSync(DLP)) api.broadcast({ op: "status", data: "YTDLP already exists" });
  else {
    api.broadcast({ op: "status", data: "Downloading YTDLP" });
    await fs.promises
      .writeFile(DLP, Buffer.from((await axios(YT_DLP_BIN_URL, { responseType: "arraybuffer" })).data))
      .then(async () => !WIN32 && (await execute(`chmod +x ${DLP}`)));
    api.broadcast({ op: "status", data: "Downloaded YTDLP" });
  }

  if (fs.existsSync(FFMPEG)) api.broadcast({ op: "status", data: "FFMPEG already exists" });
  else {
    api.broadcast({ op: "status", data: "Downloading FFMPEG" });
    await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: "./bin" }))();
    api.broadcast({ op: "status", data: "Downloaded FFMPEG" });
  }

  if (fs.existsSync(FFPROBE)) api.broadcast({ op: "status", data: "FFMPEG already exists" });
  else {
    api.broadcast({ op: "status", data: "Downloading FFPROBE" });
    await promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: "./bin" }))();
    api.broadcast({ op: "status", data: "Downloaded FFPROBE" });
  }
}
