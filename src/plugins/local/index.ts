import path from "node:path";
import { readdirSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function parse(file: string) {
  return JSON.parse(
    spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]).output[1]?.toString() || "{}",
  );
}

type AudioFile = { path: string; name: string; metadata: any };
type DirNode = { name: string; path: string; files: AudioFile[]; dirs: DirNode[] };

const SUPPORTED_CODECS = new Set(["mp3", "wav", "ogg", "flac", "m4a", "aac", "opus", "webm"]);
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".webm"]);

async function scanAudioDir(dir: string): Promise<DirNode | null> {
  const name = path.basename(dir);

  if (name.startsWith(".")) return null;

  const entries = readdirSync(dir, { withFileTypes: true });

  const node: DirNode = { name, path: dir, files: [], dirs: [] };

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.resolve(dir, entry.name);

    if (entry.isDirectory()) {
      const child = await scanAudioDir(fullPath);
      if (child) (node.dirs ||= []).push(child);
      continue;
    }

    if (entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      node.files.push({ metadata: {}, name: entry.name, path: fullPath });
  }

  return node.files.length || Object.keys(node.dirs).length ? node : null;
}

console.time("scan");
const tree = await scanAudioDir(path.resolve("D:/Projects/AMDL"));
writeFileSync("./res.json", JSON.stringify(tree || {}, null, 2));
console.timeEnd("scan");

// await parse("D:\\Projects\\AMDL\\Favorites\\3 0 0 T H O U S a N D.m4a");

// const { default: data } = await import("../../../res2.json");

// const audio = data.streams.find((s) => s.codec_type === "audio")!;

// const metadata = {
//   remuxNeeded: audio.codec_name === "alac",

//   id: null,
//   url: null,
//   title: "",
//   thumb: null,
//   source: "LOCAL",
//   duration: Math.round(parseFloat(audio.duration)),
//   copyright: data.format.tags.copyright,
//   explicit: ["1", "true", "yes"].includes(
//     String(data.format.tags.ITUNESADVISORY || data.format.tags.EXPLICIT).toLowerCase(),
//   ),
//   album: data.format.tags.album ? { name: data.format.tags.album || "Unknown", type: "ALBUM" } : null,
//   genre: data.format.tags.genre ? data.format.tags.genre.split(/[,;/]\s*/).filter(Boolean) : ["Unknown"],

//   artists: data.format.tags.artist
//     ? data.format.tags.artist
//         .split(/[,;]\s*/)
//         .filter(Boolean)
//         .map((name) => ({ name, type: "MAIN" }))
//     : [{ name: "Unknown", type: "MAIN" }],

//   resolution:
//     (Number(audio.channels) || 0) > 2
//       ? "DD"
//       : Number(audio.bits_per_raw_sample) >= 24
//         ? "HR"
//         : Number(audio.bits_per_raw_sample) === 16
//           ? "CD"
//           : "SR",
// };
