import fs from "node:fs";
import path from "node:path";
import { probe } from "./probe";
import { Semaphore } from "./sepmaphore";
import { chunk } from "../../shared/helpers";
import { meta, settings, tree } from "../database";
import { Track } from "../../shared/types/sourcePlugin";
import { DirNode, File } from "../../shared/types/utils";
import { AUDIO_EXTENSIONS } from "../../shared/constants";

export async function setMediaFolder(dir: string) {
  settings.set("mediaFolder", dir);
}

export async function getMediaFolder() {
  return settings.get("mediaFolder") as string | null;
}

export async function getMediaFilesTree() {
  if (!tree.get("local")) {
    const mediaFolder = (await getMediaFolder())!;

    const scanned = await scanMediaFolder(mediaFolder);
    if (!scanned) return { dirs: [], files: [], name: path.basename(mediaFolder), path: mediaFolder };

    const fingerprinted = await fingerprintMediaFiles(scanned);
    tree.set("local", fingerprinted);
  }

  return tree.get("local") as DirNode<true>;
}

export async function scanMediaFolder(dir: string) {
  const name = path.basename(dir);
  if (name.startsWith(".")) return;
  const node: DirNode = { name, path: dir, files: [], dirs: [] };
  const entries = (await fs.promises.readdir(dir, { withFileTypes: true })).filter((e) => !e.name.startsWith("."));

  node.files = entries
    .filter((e) => e.isFile() && AUDIO_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => ({ name: e.name, path: path.resolve(dir, e.name) }));

  for (const directory of entries.filter((e) => e.isDirectory())) {
    const child = await scanMediaFolder(path.resolve(dir, directory.name));
    child && node.dirs.push(child);
  }

  if (node.files.length || node.dirs.length) return node;
}

export async function fingerprintMediaFiles(tree: DirNode<false>): Promise<DirNode<true>> {
  const promises: (() => Promise<void>)[] = [];

  function traverse(node: DirNode<false>) {
    for (const file of node.files)
      //@ts-ignore assigning prop
      promises.push(async () => await fs.promises.stat(file.path).then((s) => void (file.id = s.ino.toString())));
    for (const dir of node.dirs) traverse(dir);
  }

  traverse(tree);
  for (const promiseChunk of chunk(promises, 100)) await Promise.all(promiseChunk.map((fn) => fn()));
  return tree as unknown as DirNode<true>;
}

const sem = new Semaphore(16);

function flatten<T extends boolean>(node: DirNode<T>): DirNode<T>["files"] {
  if (!node) return [];
  return [...node.files, ...node.dirs.flatMap((e) => flatten(e))];
}

async function extractMetadata(tree: DirNode<true>) {
  const flat = flatten(tree);
  console.log(flat.length);
  const results = await Promise.all(
    flat.map((file) => sem.run(() => probe(file.path).then((meta) => ({ key: file.id, value: transform(file, meta) })))),
  );
  meta.setMany(results);
}

function transform(file: File<true>, metadata: Awaited<ReturnType<typeof probe>>) {
  return {
    id: file.id,
    streamURI: file.path,
    thumb: `${file.id}.jpg`,
    explicit: metadata.explicit,
    duration: metadata.duration,
    lyrics: "No lyrics found",
    resolution: metadata.resolution,
    title: path.basename(file.path, path.extname(file.path)),
    album: { name: metadata.album, id: "0", thumb: `${file.id}.jpg` },
    artists: metadata.artists.map((name) => ({ name, thumb: "", id: "" })),
  } satisfies Track<true>;
}

(async () => {
  // setMediaFolder("D:/projects/amdl/favorites");
  setMediaFolder("D:/music");
  tree.delete("local");
  const t = await getMediaFilesTree();
  console.time("Probing");
  await extractMetadata(t);
  console.timeEnd("Probing");
})();

// async buildThumbnails(tree: DirNode<true>) {
//     if (!fs.existsSync("./.thumbnails")) fs.mkdirSync("./.thumbnails");
//     const flattenedTree = this.flatten(tree);
//     const chunks = chunk(flattenedTree, 10);
//     const failed: string[] = [];

//     for (let i = 0; i < chunks.length; i++)
//       await Promise.all(
//         chunks[i]!.map((file) => {
//           if (!fs.existsSync(`./.thumbnails/${file.id}.jpg`))
//             thumb(file.path, `./.thumbnails/${file.id}.jpg`).catch(() => failed.push(file.id));
//         }),
//       );

//     this.meta.setMany(this.meta.getMany(failed).map((track) => ({ key: track!.id, value: { ...track!, thumb: this.#defaultThumbnail } })));
//   }

//   async list(tree: DirNode<true>, categorize: "artist" | "album" | "track" = "track") {
//     const flattenedTree = this.flatten(tree);
//     const meta = this.meta.getMany(flattenedTree.map((e) => e.id));

//     if (categorize === "track") return meta.filter(Boolean);
//     if (categorize === "album") return Object.groupBy(meta, (e) => e!.album.name);
//     if (categorize === "artist") return Object.groupBy(meta, (e) => e!.artists[0]!.name);
//   }
