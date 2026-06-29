/** @format */

import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

export const WIN32 = process.platform === "win32";
const wd = app.isPackaged ? app.getPath("appData") : path.resolve(process.cwd(), "temp");

export const directories = {
  bin: path.resolve(wd, "bin"),
  temp: path.resolve(wd, "temp"),
  database: path.resolve(wd, "database"),
  thumbnails: path.resolve(wd, "thumbnails"),
};

for (const directory of Object.values(directories)) if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

export const DLP = path.resolve(directories.bin, WIN32 ? "yt-dlp.exe" : "yt-dlp");
export const FFMPEG = path.resolve(directories.bin, WIN32 ? "ffmpeg.exe" : "ffmpeg");
export const FFPROBE = path.resolve(directories.bin, WIN32 ? "ffprobe.exe" : "ffprobe");

export const YT_DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;

export const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".webm"]);
