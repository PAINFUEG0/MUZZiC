import * as fs from "node:fs";
import * as path from "node:path";
import { chunk } from "../shared/helpers.js";
import { CoreDatabase } from "@xenodb/server";
import { DirNode } from "../shared/types/utils.js";
import { Track } from "../shared/types/sourcePlugin.js";
import { walk, finger, probe, thumb } from "../plugins/local/index.js";

const perChunk = 10;
const dir = "../Projects/AMDL/random";
// const dir = "../Projects/AMDL/downloads";

const tracks = new CoreDatabase<any>("./database/tracks/tracks");
const defaultThumbnail = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg";

const index = new CoreDatabase<DirNode<boolean>>("./database/tracks/index");

console.log("Database initialized");

console.log("Walking directory (%s)", dir);
const walkStart = performance.now();
const tree = await walk(dir);
if (!tree) throw new Error("Tree is empty");
index.set("tree", tree);
console.log("Tree generated in %d ms", performance.now() - walkStart);

console.log("Fingering tree");
const fingerStart = performance.now();
const indexedTree = await finger(tree);
index.set("tree", indexedTree);
const flat = flatten(indexedTree);
console.log("Fingerprinting completed in %d ms (%d files)", performance.now() - fingerStart, flat.length);

console.log("Probing files");
const fileChunks = chunk(flat, perChunk);
const probeStart = performance.now();

const data: Parameters<typeof tracks.setMany>[0] = [];
for (let i = 0; i < fileChunks.length; i++) {
  console.log("Probing chunk %d/%d", i + 1, fileChunks.length);
  const start = performance.now();
  await Promise.all(
    fileChunks[i]!.map((file) =>
      probe(file.path).then((meta) =>
        data.push({
          key: file.id,
          value: {
            id: file.id,
            streamURI: file.path,
            thumb: `${file.id}.jpg`,
            explicit: meta.explicit,
            duration: meta.duration,
            lyrics: "No lyrics found",
            resolution: meta.resolution,
            title: path.basename(file.path, path.extname(file.path)),
            album: { name: meta.album, id: "0", thumb: `${file.id}.jpg` },
            artists: meta.artists.map((name) => ({ name, thumb: "", id: "" })),
          } satisfies Track<true>,
        }),
      ),
    ),
  );
  console.log("Probed (%d files) in %d ms", fileChunks[i]?.length, performance.now() - start);
}
tracks.setMany(data);
console.log("Probing completed in %d ms", performance.now() - probeStart);

const failed: string[] = [];
if (!fs.existsSync("./.thumbnails")) fs.mkdirSync("./.thumbnails");

console.log("Extracting thumbnails");
const thumbStart = performance.now();
for (let i = 0; i < fileChunks.length; i++) {
  const start = performance.now();
  await Promise.all(fileChunks[i]!.map((file) => thumb(file.path, `./.thumbnails/${file.id}.jpg`).catch(() => failed.push(file.id))));
  console.log("Extracted thumbnails (%d files) in %d ms", fileChunks[i]?.length, performance.now() - start);
}
tracks.setMany(tracks.getMany(failed).map((track) => ({ key: track.id, value: { ...track, thumb: defaultThumbnail } })));
console.log("Thumbnail extraction completed in %d ms", performance.now() - thumbStart);
console.log("Failed to extract thumbnails for %d files", failed.length);

function flatten<T extends boolean>(node: DirNode<T>): DirNode<T>["files"] {
  if (!node) return [];
  return [...node.files, ...node.dirs.flatMap(flatten)];
}

process.on("SIGINT", () => setTimeout(() => process.exit(), 500));
