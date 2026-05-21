import path from "path";
import { Spinner } from "./writer.js";
import { DirNode } from "../shared/types/utils.js";
import { setTimeout as sleep } from "timers/promises";
import { LocalResourceProvider } from "../plugins/local/index.js";

const dir = "../music/old";
const provider = new LocalResourceProvider();

const spinner = new Spinner();
spinner.start("Initializing Local Resource Provider");
await provider.init();
await sleep(500);
spinner.end("√ Initializing Local Resource Provider");

spinner.start(`Scanning directory (${dir})`);
const unIndexedTree = (await provider.scan(dir)) || ({ name: path.basename(dir), path: dir, files: [], dirs: [] } as DirNode<false>);
provider.tree.set("local", unIndexedTree);
spinner.end(`√ Scanning directory (${dir})`);

spinner.start(`Fingering directory (${dir})`);
const indexedTree = await provider.finger(unIndexedTree);
provider.tree.set("local", indexedTree);
spinner.end(`√ Fingering directory (${dir})`);

spinner.start(`Probing directory (${dir})`);
await provider.probe(indexedTree);
spinner.end(`√ Probing directory (${dir})`);

spinner.start(`Building thumbnails (${dir})`);
await provider.buildThumbnails(indexedTree);
spinner.end(`√ Building thumbnails (${dir})`);

process.on("SIGINT", () => setTimeout(() => process.exit(), 500));
