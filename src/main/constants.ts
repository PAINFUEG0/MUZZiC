/** @format */

import fs from "node:fs";
import eˉ from "electron";
import path from "node:path";
import pkg from "../../package.json";

export const WIN32 = process.platform === "win32";
const wd = eˉ.app.isPackaged ? eˉ.app.getPath("appData") : path.resolve(process.cwd(), ".");

export const directories = {
  bin: path.resolve(wd, pkg.appUserModelId, "bin"),
  temp: path.resolve(wd, pkg.appUserModelId, "temp"),
  database: path.resolve(wd, pkg.appUserModelId, "database"),
  thumbnails: path.resolve(wd, pkg.appUserModelId, "thumbnails"),
};

export const SURROUND_HIRES = [".dts", ".thd", ".mlp", ".dsf", ".dff"];
export const VIDEO = [".mp4", ".m4v", ".mov", ".mkv", ".webm", ".avi", ".flv", ".wmv"];
export const LOSSLESS_AUDIO = [".flac", ".alac", ".wav", ".wv", ".ape", ".tak", ".tta"];
export const AUDIO_ONLY = [".m4b", ".m4p", ".mka", ".oga", ".aiff", ".aif", ".au", ".caf", ".amr"];
export const LOSSY_AUDIO = [".mp3", ".aac", ".m4a", ".ogg", ".opus", ".wma", ".mp2", ".ac3", ".ac4"];

export const SURROUND = new Set(["ac3", "eac3", "dts", "dtshd", "truehd", "mlp"]);
export const DSD = new Set(["dsd_lsbf", "dsd_msbf", "dsd_lsbf_planar", "dsd_msbf_planar"]);
export const LOSSY = new Set(["mp3", "aac", "opus", "vorbis", "wmav1", "wmav2", "mp2", "ac4"]);
export const LOSSLESS = new Set(["flac", "alac", "pcm_s16le", "pcm_s24le", "pcm_s32le", "wavpack", "ape", "tak"]);

export const AUDIO_EXTENSIONS = new Set([...VIDEO, ...AUDIO_ONLY, ...LOSSY_AUDIO, ...SURROUND_HIRES, ...LOSSLESS_AUDIO]);

fs.existsSync(directories.temp) && fs.readdirSync(directories.temp).forEach((f) => fs.rmSync(path.resolve(directories.temp, f), { force: true }));
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
