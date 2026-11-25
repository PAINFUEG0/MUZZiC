/** @format */

import axios, { AxiosError } from "axios";
import { api } from "./server";
import { settings } from "./database";
import { Node, Track } from "../shared/types";
import { setTimeout } from "timers/promises";
import { safeAwait } from "./utils/safeAwait";

export class Lavalink {
  nodes: Node<true>[] = [];

  list = "https://lavalink-list.ajieblogs.eu.org/All";

  async fetchLavalinkNodes(usePublicNodes = true) {
    api.broadcast({ type: "MESSAGE", data: "Fetching nodes from public listings" });

    const [res] = usePublicNodes ? await safeAwait(axios<Node[]>(this.list)) : [undefined];
    const publicNodes = (res?.data || []).map((n) => ((n.type = "public"), n));
    const customNodes = settings.get("settings")?.nodes || [];
    const nodes = [...publicNodes, ...customNodes];

    api.broadcast({ type: "MESSAGE", data: `Checking ${nodes.length} nodes for /youtube/stream/id endpoint` });
    this.nodes = await Promise.all(nodes.map((n) => this.checkNode(n))).then((r) => r.filter((n) => n !== undefined).sort((a, b) => b.downloadSpeed - a.downloadSpeed));

    api.broadcast({ type: "MESSAGE", data: `Finished checking nodes. Found ${this.nodes.length} functional nodes` });
    return this.nodes;
  }

  async checkNode(node: Node) {
    api.broadcast({ type: "MESSAGE", data: `Checking ${node.host}:${node.port}` });

    const protocol = node.secure ? "https" : "http";
    const url = `${protocol}://${node.host}:${node.port}/youtube/stream/dQw4w9WgXcQ?itag=140`;

    const start = performance.now();
    const [res, err] = await safeAwait<axios.AxiosResponse<any, any, {}>, AxiosError>(axios.get(url, { headers: { Authorization: node.password }, responseType: "stream", timeout: 10_000 }));
    const end = performance.now();

    if (err) return void api.broadcast({ type: "MESSAGE", data: `Failed ${node.host}:${node.port} - ${err.code}` });

    let bytes = 0;
    const stream = res.data;
    stream.on("data", (chunk: Buffer) => (bytes += chunk.length));

    await setTimeout(1000);
    const downloadSpeed = Math.round(bytes / 1024);
    await stream.destroy();

    api.broadcast({ type: "MESSAGE", data: `${node.host}:${node.port} | ${downloadSpeed} KB/s | ${Math.round(end - start)}ms` });
    return { ...node, youtube: true, downloadSpeed, resolutionTime: Math.round(end - start) / 1000 } satisfies Node<true>;
  }

  async addNode(nodeConfig: Node) {
    const _ = settings.get("settings") || {};
    const node = await this.checkNode(nodeConfig);
    node && settings.set("settings", { ..._, nodes: [...(_.nodes || []), nodeConfig] });
    node && (this.nodes = [...this.nodes, node].sort((a, b) => b.downloadSpeed - a.downloadSpeed));
    return node ? this.nodes : undefined;
  }

  async removeNode(url: string) {
    const _ = settings.get("settings") || {};
    this.nodes = this.nodes.filter((n) => url !== `${n.host}:${n.port}`);
    settings.set("settings", { ..._, nodes: [...(_.nodes || []).filter((n) => url !== `${n.host}:${n.port}`)] });
    return this.nodes;
  }

  async search(query: string): Promise<Track[]> {
    const node = this.nodes[0];
    if (!node) return [];
    const url = `http${node.secure ? "s" : ""}://${node.host}:${node.port}/v4/loadtracks`;
    const [res, error] = await safeAwait(axios.get(url, { params: { identifier: `ytsearch:${query}` }, headers: { Authorization: node.password } }));
    return (error ? [] : res.data.loadType === "search" ? res.data.data : []).map(this.transformTrack);
  }

  transformTrack(track: any) {
    return {
      channels: 2,
      explicit: false,
      album: "Unknown",
      codec: "UNKNOWN",
      layout: "STEREO",
      lyrics: "No lyrics found",
      name: `${track.info.title}`,
      title: `${track.info.title}`,
      artists: [track.info.author],
      id: `${track.info.identifier}`,
      duration: track.info.length / 1000,
      path: `yt:${track.info.identifier}`,
      thumb: track.info.artworkUrl.replace("mqdefault", "maxresdefault"),
      resolution: { name: "SR", bitDepth: 0, sampleRate: 44100, bitrate: 128000, sampleFormat: "UNKNOWN" },
    } satisfies Track;
  }
}

export const lavalinkHelper = new Lavalink();
