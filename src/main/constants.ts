/** @format */

import fs from "node:fs";
import eˉ from "electron";
import path from "node:path";

export const WIN32 = process.platform === "win32";
const wd = eˉ.app.isPackaged ? eˉ.app.getPath("appData") : path.resolve(process.cwd(), "temp");

export const directories = {
  bin: path.resolve(wd, "bin"),
  temp: path.resolve(wd, "temp"),
  database: path.resolve(wd, "database"),
  thumbnails: path.resolve(wd, "thumbnails"),
};

for (const directory of Object.values(directories)) if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

export const bin = {
  dlp: path.resolve(directories.bin, WIN32 ? "yt-dlp.exe" : "yt-dlp"),
  ffmpeg: path.resolve(directories.bin, WIN32 ? "ffmpeg.exe" : "ffmpeg"),
  ffprobe: path.resolve(directories.bin, WIN32 ? "ffprobe.exe" : "ffprobe"),
};

export const DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;
export const FFMPEG_BIN_URL = `https://github.com/eugeneware/ffmpeg-static/releases/latest/download/ffmpeg-${process.platform}-${process.arch}`;
export const FFPROBE_BIN_URL = `https://github.com/eugeneware/ffmpeg-static/releases/latest/download/ffprobe-${process.platform}-${process.arch}`;

export const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".webm"]);
