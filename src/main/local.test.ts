import fs from "fs";
import path from "path";
import { DirNode } from "../shared/types/utils.js";
import { LocalResourceProvider } from "../plugins/local/index.js";

console.log("Initializing Local Resource Provider");

const dir = "../music";
const provider = new LocalResourceProvider();

await provider.init();

console.log("Scanning directory (%s)", dir);
const unIndexedTree = (await provider.scan(dir)) || ({ name: path.basename(dir), path: dir, files: [], dirs: [] } as DirNode<false>);
provider.tree.set("local", unIndexedTree);

console.log("Fingering directory (%s)", dir);
const indexedTree = await provider.finger(unIndexedTree);
provider.tree.set("local", indexedTree);

console.log("Probing directory (%s)", dir);
await provider.probe(indexedTree);

console.log("Building thumbnails (%s)", dir);
await provider.buildThumbnails(indexedTree);

fs.writeFileSync("./tracks.json", JSON.stringify(await provider.list(indexedTree, "track"), null, 2));
fs.writeFileSync("./albums.json", JSON.stringify(await provider.list(indexedTree, "album"), null, 2));
fs.writeFileSync("./artists.json", JSON.stringify(await provider.list(indexedTree, "artist"), null, 2));

const artistSorted = await provider.list(indexedTree, "artist");
console.log(
  Object.keys(artistSorted!)
    //@ts-expect-error none
    .filter((e) => artistSorted[e].length > 1)
    //@ts-expect-error none
    .sort((a, b) => artistSorted[b].length - artistSorted[a].length)
    //@ts-expect-error none
    .map((e) => `[${artistSorted[e].length}] ${e}`),
);

process.on("SIGINT", () => setTimeout(() => process.exit(), 500));
