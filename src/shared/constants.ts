export const formats = {
  HIGH: { format: "AACLC", ext: "flac" },
  LOW: { format: "HEAACV1", ext: "flac" },
  LOSSLESS: { format: "FLAC", ext: "flac" },
  ATMOS: { format: "EAC3_JOC", ext: "mp4" },
  HIRES_LOSSLESS: { format: "FLAC_HIRES", ext: "flac" },
};

export const fallbackImage = "https://cdn.vectorstock.com/i/500p/33/47/no-photo-available-icon-vector-40343347.jpg";

export const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".webm"]);
