import * as path from "node:path";
import { walk } from "./helpers/walk.js";
import { probe } from "./helpers/probe.js";
import { finger } from "./helpers/finger.js";
import { CoreDatabase } from "@xenodb/server";
import { chunk } from "../../shared/helpers.js";
import { DirNode } from "../../shared/types/utils.js";
import { Track } from "../../shared/types/sourcePlugin.js";
import { existsSync, mkdirSync } from "node:fs";
import { thumb } from "./helpers/thumb.js";

type State = "WALKED" | "FINGERED" | "PROBED";

const dir = "../Projects/AMDL/downloads";

const state = new CoreDatabase<State>("./database/tracks/state");
const tracks = new CoreDatabase<any>("./database/tracks/tracks");
const index = new CoreDatabase<DirNode<boolean>>("./database/tracks/index");

console.time("total");
console.time("walk");
const tree = await walk(dir);
if (!tree) throw new Error("Tree is empty");
index.set("tree", tree);
state.set("state", "WALKED");
console.timeEnd("walk");

console.time("finger");
const indexedTree = await finger(tree);
index.set("tree", indexedTree);
state.set("state", "FINGERED");
console.timeEnd("finger");

const flat = flatten(indexedTree);

console.time("probe");
const perChunk = 10;
const data: Parameters<typeof tracks.setMany>[0] = [];
const fileChunks = chunk(flat, perChunk);
for (let i = 0; i < fileChunks.length; i++) {
  console.time(`[${i * perChunk + fileChunks[i]!.length}/${flat.length}] probe`);
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
  console.timeEnd(`[${i * perChunk + fileChunks[i]!.length}/${flat.length}] probe`);
}
tracks.setMany(data);
state.set("state", "PROBED");
console.timeEnd("probe");

if (!existsSync("./.thumbnails")) mkdirSync("./.thumbnails");

console.time("thumb");
const _perChunk = 10;
const _fileChunks = chunk(flat, _perChunk);
for (let i = 0; i < _fileChunks.length; i++) {
  console.time(`[${i * _perChunk + _fileChunks[i]!.length}/${flat.length}] thumb`);
  await Promise.all(_fileChunks[i]!.map((file) => thumb(file.path, `./.thumbnails/${file.id}.jpg`)));
  console.timeEnd(`[${i * _perChunk + _fileChunks[i]!.length}/${flat.length}] thumb`);
}
console.timeEnd("thumb");
console.timeEnd("total");

function flatten<T extends boolean>(node: DirNode<T>): DirNode<T>["files"] {
  if (!node) return [];
  return [...node.files, ...node.dirs.flatMap(flatten)];
}

process.on("SIGINT", () => setTimeout(() => process.exit(), 500));
