import { CoreDatabase } from "@xenodb/server";
import { chunk } from "../../shared/helpers.js";
import { transform } from "./helpers/transform.js";
import { scanAudioDir } from "./helpers/scanDir.js";
import { DirNode } from "../../shared/types/utils.js";
import { Track } from "../../shared/types/sourcePlugin.js";

const dir = "D:/Projects/AMDL/";
const index = new CoreDatabase<DirNode>("./database/tracks/index");
const tracks = new CoreDatabase<Track>("./database/tracks/tracks");

console.time("scan");
const tree = await scanAudioDir(dir);
console.timeEnd("scan");

async function build(node: typeof tree) {
  if (!node) return;
  for (const c of chunk(node.files, 10))
    await Promise.all(
      c.map(async (file, i) => {
        console.log(`[${i}] ${file.name}`);
        if (tracks.has(file.id)) return;
        const track = await transform(file);
        tracks.set(file.id, track);
      }),
    );
  for (const dir of node.dirs) await build(dir);
}

console.log("Indexing...");
console.time("build");
await build(tree);
console.timeEnd("build");
tree ? index.set("tracks", tree) : index.delete("tracks");
