import * as fs from "node:fs";
import * as path from "node:path";
import { walk } from "./helpers/walk.js";
import { probe } from "./helpers/probe.js";
import { thumb } from "./helpers/thumb.js";
import { finger } from "./helpers/finger.js";
import { CoreDatabase } from "@xenodb/server";
import { chunk } from "../../shared/helpers.js";
import { DirNode } from "../../shared/types/utils.js";
import { Track } from "../../shared/types/sourcePlugin.js";

const perChunk = 10;
// const dir = "../Projects/AMDL/downloads";
const dir = "../Music/old";

const tracks = new CoreDatabase<any>("./database/tracks/tracks");
const defaultThumbnail = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg";

const index = new CoreDatabase<DirNode<boolean>>("./database/tracks/index");

const tree = await walk(dir);
if (!tree) throw new Error("Tree is empty");

index.set("tree", tree);

const indexedTree = await finger(tree);
index.set("tree", indexedTree);

const flat = flatten(indexedTree);

const fileChunks = chunk(flat, perChunk);

const data: Parameters<typeof tracks.setMany>[0] = [];
for (let i = 0; i < fileChunks.length; i++)
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

tracks.setMany(data);

if (!fs.existsSync("./.thumbnails")) fs.mkdirSync("./.thumbnails");

const failed: string[] = [];

for (let i = 0; i < fileChunks.length; i++)
  await Promise.all(fileChunks[i]!.map((file) => thumb(file.path, `./.thumbnails/${file.id}.jpg`).catch(() => failed.push(file.id))));

tracks.setMany(tracks.getMany(failed).map((track) => ({ key: track.id, value: { ...track, thumb: defaultThumbnail } })));

function flatten<T extends boolean>(node: DirNode<T>): DirNode<T>["files"] {
  if (!node) return [];
  return [...node.files, ...node.dirs.flatMap(flatten)];
}

process.on("SIGINT", () => setTimeout(() => process.exit(), 500));
