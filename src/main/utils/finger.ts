import fs from "node:fs";
import { chunk } from "../../shared/helpers.js";
import { DirNode } from "../../shared/types/utils.js";

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
