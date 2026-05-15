import fs from "fs";
import path from "path";
import { promisify } from "util";
import { createHash } from "crypto";
import { execFile } from "child_process";
import { CoreDatabase } from "@xenodb/server";
import { chunk } from "../../shared/helpers.js";
import { scanAudioDir } from "./helpers/scanDir.js";
import { fallbackImage } from "../../shared/constants.js";
import { Track } from "../../shared/types/sourcePlugin.js";
import { DirNode, File } from "../../shared/types/utils.js";
import { extractAudioMetadata } from "./helpers/extractMetadata.js";

console.time("scan");

const dir = "D:/Projects/AMDL/Random";
const execFileAsync = promisify(execFile);
const thumbDir = path.resolve(process.cwd(), "./.thumbnails");
const index = new CoreDatabase<DirNode>("./database/tracks/index");
const tracks = new CoreDatabase<Track>("./database/tracks/tracks");
const thumbs: { filePath: string; fileId: string; albumId: string }[] = [];

const tree = await scanAudioDir(dir);
index.set("tracks", tree!);

if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

console.log("Found ", flatten(tree!).length, " tracks");

for (const fileChunk of chunk(flatten(tree!), 16))
  await Promise.all(
    fileChunk.map(async (file) => {
      if (tracks.has(file.id)) return;

      const meta = await extractAudioMetadata(file.path);
      const albumId = createHash("sha1").update(meta.album).digest("hex").toString();

      const thumb = path.resolve(thumbDir, `${albumId}.jpg`);

      thumbs.push({ filePath: file.path, fileId: file.id, albumId });

      const track = {
        thumb,
        id: file.id,
        streamURI: file.path,
        explicit: meta.explicit,
        duration: meta.duration,
        lyrics: "No lyrics found",
        resolution: meta.resolution,
        album: { name: meta.album, id: albumId, thumb },
        title: path.basename(file.path, path.extname(file.path)),
        artists: meta.artists.map((a) => ({
          name: a,
          thumb: fallbackImage,
          id: createHash("sha1").update(a).digest("hex").toString(),
        })),
      } satisfies Track<true>;

      tracks.set(file.id, track);
    }),
  );

const extractionPromises = Object.entries(Object.groupBy(thumbs, (v) => v.albumId)).map(([albumId, entries]) => async () => {
  const outputPath = path.resolve(thumbDir, `${albumId}.jpg`);

  if (fs.existsSync(outputPath)) return;

  await execFileAsync("ffmpeg", [
    "-i",
    entries![0]!.filePath,
    "-an",
    "-vf",
    `scale=${750}:-1`,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    "-y",
    outputPath,
  ]).catch(() =>
    tracks.setMany(tracks.getMany(entries!.map((t) => t.fileId)).map((v) => ({ key: v!.id, value: { ...v!, thumb: fallbackImage } }))),
  );
});

for (const promiseChunk of chunk(extractionPromises, 10)) await Promise.all(promiseChunk.map((fn) => fn()));

function flatten(node: typeof tree): File[] {
  if (!node) return [];
  return [...node.files, ...node.dirs.flatMap(flatten)];
}

console.timeEnd("scan");
