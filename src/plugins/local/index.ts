import * as fs from "node:fs";
import * as path from "node:path";
import { probe } from "./helpers/probe.js";
import { thumb } from "./helpers/thumb.js";
import { CoreDatabase } from "@xenodb/server";
import { chunk } from "../../shared/helpers.js";
import { Track } from "../../shared/types/sourcePlugin.js";
import { DirNode, File } from "../../shared/types/utils.js";
import { AUDIO_EXTENSIONS } from "../../shared/constants.js";

export class LocalResourceProvider {
  meta = new CoreDatabase<Track<true>>("./database/local/meta");
  tree = new CoreDatabase<DirNode<boolean>>("./database/local/tree");
  #defaultThumbnail = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg";

  constructor() {}

  async init() {}

  #flatten<T extends boolean>(node: DirNode<T>): DirNode<T>["files"] {
    if (!node) return [];
    return [...node.files, ...node.dirs.flatMap((e) => this.#flatten(e))];
  }

  async scan(dir: string) {
    const name = path.basename(dir);
    if (name.startsWith(".")) return;
    const node: DirNode = { name, path: dir, files: [], dirs: [] };
    const entries = (await fs.promises.readdir(dir, { withFileTypes: true })).filter((e) => !e.name.startsWith("."));

    node.files = entries
      .filter((e) => e.isFile() && AUDIO_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
      .map((e) => ({ name: e.name, path: path.resolve(dir, e.name) }));

    for (const directory of entries.filter((e) => e.isDirectory())) {
      const child = await this.scan(path.resolve(dir, directory.name));
      child && node.dirs.push(child);
    }

    if (node.files.length || node.dirs.length) return node;
  }

  async finger(tree: DirNode<false>): Promise<DirNode<true>> {
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

  #transform(file: File<true>, metadata: Awaited<ReturnType<typeof probe>>) {
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

  async probe(tree: DirNode<true>) {
    const flattenedTree = this.#flatten(tree);
    const filtered = flattenedTree.filter((f) => !this.meta.has(f.id));
    const chunks = chunk(filtered, 10);

    for (let i = 0; i < chunks.length; i++)
      this.meta.setMany(
        await Promise.all(
          chunks[i]!.map((file) => probe(file.path).then((meta) => ({ key: file.id, value: this.#transform(file, meta) }))),
        ),
      );
  }

  async buildThumbnails(tree: DirNode<true>) {
    if (!fs.existsSync("./.thumbnails")) fs.mkdirSync("./.thumbnails");
    const flattenedTree = this.#flatten(tree);
    const chunks = chunk(flattenedTree, 10);
    const failed: string[] = [];

    for (let i = 0; i < chunks.length; i++)
      await Promise.all(
        chunks[i]!.map((file) => {
          if (!fs.existsSync(`./.thumbnails/${file.id}.jpg`))
            thumb(file.path, `./.thumbnails/${file.id}.jpg`).catch(() => failed.push(file.id));
        }),
      );

    this.meta.setMany(this.meta.getMany(failed).map((track) => ({ key: track!.id, value: { ...track!, thumb: this.#defaultThumbnail } })));
  }
}
