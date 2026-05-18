import path from "path";
import { DirNode } from "../shared/types/utils.js";
import { LocalResourceProvider } from "../plugins/local/index.js";

console.log("Initializing Local Resource Provider");

const dir = "../Music/old";
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

process.on("SIGINT", () => setTimeout(() => process.exit(), 500));
