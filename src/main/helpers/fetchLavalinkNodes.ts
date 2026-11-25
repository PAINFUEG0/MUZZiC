/** @format */

import axios from "axios";
import { api } from "../server";
import { settings } from "../database.js";
import { Node } from "../../shared/types.js";
import { safeAwait } from "../utils/safeAwait.js";
import { setTimeout } from "node:timers/promises";

const VIDEO_ID = "dQw4w9WgXcQ";
const LIST_URL = "https://lavalink-list.ajieblogs.eu.org/All";

export async function fetchLavalinkNodes(usePublicNodes = true) {
  api.broadcast({ type: "MESSAGE", data: "Fetching Lavalink nodes . . ." });

  const [res] = usePublicNodes ? await safeAwait(axios<Node[]>(LIST_URL)) : [undefined];
  const nodes = [...(res?.data || []).map((n) => ((n.type = "public"), n)), ...(settings.get("settings")?.nodes || [])];

  api.broadcast({ type: "MESSAGE", data: `Checking ${nodes.length} nodes for /youtube/stream/id endpoint` });
  const checked = await Promise.all(nodes.map((n) => checkNode(n)));

  api.broadcast({ type: "MESSAGE", data: `Finished checking nodes. Found ${checked.filter((n) => n !== undefined).length} functional nodes` });
  await setTimeout(300);
  return checked.sort((a, b) => b!.downloadSpeed - a!.downloadSpeed).filter((n) => n !== undefined);
}

export async function checkNode(node: Node): Promise<Node<true> | undefined> {
  api.broadcast({ type: "MESSAGE", data: `Checking ${node.host}:${node.port}` });

  const protocol = node.secure ? "https" : "http";
  const url = `${protocol}://${node.host}:${node.port}/youtube/stream/${VIDEO_ID}?itag=140`;

  const start = performance.now();
  const [res, err] = await safeAwait(axios.get(url, { headers: { Authorization: node.password }, responseType: "stream", timeout: 10_000 }));
  const end = performance.now();

  if (err) return void api.broadcast({ type: "MESSAGE", data: `Failed ${node.host}:${node.port}` });

  let bytes = 0;
  const stream = res.data;
  stream.on("data", (chunk: Buffer) => (bytes += chunk.length));

  await setTimeout(1000);
  const downloadSpeed = Math.round(bytes / 1024);
  await stream.destroy();

  api.broadcast({ type: "MESSAGE", data: `${node.host}:${node.port} | ${downloadSpeed} KB/s | ${Math.round(end - start)}ms` });
  return { ...node, youtube: true, downloadSpeed, resolutionTime: Math.round(end - start) / 1000 };
}
