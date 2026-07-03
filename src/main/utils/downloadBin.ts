/** @format */

import { resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import axios from "axios";

const binBase = "https://github.com/eugeneware/ffmpeg-static/releases/latest/download";

export async function downloadBin(bin: "ffmpeg" | "ffprobe", destination: string) {
  const binPath = `/${bin}-${process.platform}-${process.arch}`;
  const filePath = resolve(destination, bin + (process.platform === "win32" ? ".exe" : ""));
  const { data } = await axios.get(binBase + binPath, { responseType: "stream" });
  return pipeline(data, createWriteStream(filePath));
}
