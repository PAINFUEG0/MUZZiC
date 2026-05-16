import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { CoreDatabase } from "@xenodb/server";
import { chunk } from "../../shared/helpers.js";
import { setTimeout } from "node:timers/promises";
import { scanAudioDir } from "./helpers/scanDir.js";
import { fallbackImage } from "../../shared/constants.js";
import { Track } from "../../shared/types/sourcePlugin.js";
import { DirNode, File } from "../../shared/types/utils.js";
import { extractAudioMetadata } from "./helpers/extractMetadata.js";

process.on("SIGINT", async () => {
  console.log("Exiting...");
  setTimeout(500);
  process.exit();
});

const execFileAsync = promisify(execFile);
const thumbDir = path.resolve(process.cwd(), "./.thumbnails");
const index = new CoreDatabase<DirNode>("./database/tracks/index");
const tracks = new CoreDatabase<Track>("./database/tracks/tracks");
const lyrics = new CoreDatabase<string>("./database/tracks/lyrics");
const dir = path.resolve(process.cwd(), "../Projects/AMDL/downloads");

console.log("Scanning directory...");
const start = performance.now();
const tree = await scanAudioDir(dir);
index.set("tracks", tree!);

if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

let count = 0;
const flat = flatten(tree!);

console.log(`Scanned ${flat.length} tracks in ${(performance.now() - start).toFixed(2)}ms`);

console.log("Indexing . . .");
const _start = performance.now();
for (const fileChunk of chunk(flat, 5)) {
  count += fileChunk.length;

  const start = performance.now();

  await Promise.all(
    fileChunk.map(async (file) => {
      if (tracks.has(file.id)) return;

      let thumb = path.resolve(thumbDir, `${file.id}.jpg`);

      const [meta] = await Promise.all([
        extractAudioMetadata(file.path),
        execFileAsync("./bin/ffmpeg.exe", [
          "-i",
          file.path,
          "-an",
          "-vf",
          `scale=${750}:-1`,
          "-frames:v",
          "1",
          "-q:v",
          "2",
          "-y",
          thumb,
        ]).catch(() => (thumb = fallbackImage)),
      ]);

      const track = {
        thumb,
        id: file.id,
        streamURI: file.path,
        explicit: meta.explicit,
        duration: meta.duration,
        lyrics: "No lyrics found",
        resolution: meta.resolution,
        title: path.basename(file.path, path.extname(file.path)),
        album: { name: meta.album || "Unknown", id: "0", thumb },
        artists: meta.artists.map((a) => ({
          name: a,
          thumb: fallbackImage,
          id: createHash("sha1").update(a).digest("hex").toString(),
        })),
      } satisfies Track<true>;

      tracks.set(file.id, track);
      lyrics.set(file.id, meta.lyrics || "");
    }),
  );

  const end = performance.now();

  console.log(
    `[${count}/${flat.length}] Extracted ${fileChunk.length} tracks in ${(end - start).toFixed(2)}ms - ${((fileChunk.length / (end - start)) * 1000).toFixed(2)}/s`,
  );
}

console.log(`Indexed ${count} tracks in ${(performance.now() - _start).toFixed(2)}ms`);

function flatten(node: typeof tree): File[] {
  if (!node) return [];
  return [...node.files, ...node.dirs.flatMap(flatten)];
}
