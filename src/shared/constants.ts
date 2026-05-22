export const formats = {
  HIGH: { format: "AACLC", ext: "flac" },
  LOW: { format: "HEAACV1", ext: "flac" },
  LOSSLESS: { format: "FLAC", ext: "flac" },
  ATMOS: { format: "EAC3_JOC", ext: "mp4" },
  HIRES_LOSSLESS: { format: "FLAC_HIRES", ext: "flac" },
};

export const WIN32 = process.platform === "win32";
export const DLP = WIN32 ? "./bin/yt-dlp.exe" : "./bin/yt-dlp";
export const FFMPEG = WIN32 ? "./bin/ffmpeg.exe" : "./bin/ffmpeg";
export const FFPROBE = WIN32 ? "./bin/ffprobe.exe" : "./bin/ffprobe";
export const fallbackImage = "https://cdn.vectorstock.com/i/500p/33/47/no-photo-available-icon-vector-40343347.jpg";
export const YT_DLP_BIN_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${WIN32 ? ".exe" : ""}`;

export const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".webm"]);
