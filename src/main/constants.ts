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

fs.existsSync(directories.temp) &&
  fs.readdirSync(directories.temp).forEach((f) => fs.rmSync(path.resolve(directories.temp, f), { force: true }));
for (const directory of Object.values(directories)) if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

export const bin = {
  dlp: {
    path: path.resolve(directories.bin, WIN32 ? "yt-dlp.exe" : "yt-dlp"),
    remoteResourceURI: `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`,
  },
  ffmpeg: {
    path: path.resolve(directories.bin, WIN32 ? "ffmpeg.exe" : "ffmpeg"),
    remoteResourceURI: `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.1.1/ffmpeg-${process.platform}-${process.arch}`,
  },
  ffprobe: {
    path: path.resolve(directories.bin, WIN32 ? "ffprobe.exe" : "ffprobe"),
    remoteResourceURI: `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.1.1/ffprobe-${process.platform}-${process.arch}`,
  },
};

export const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".webm"]);
