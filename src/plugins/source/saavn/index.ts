import axios from "axios";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { util, cipher } from "node-forge";
import { Transformers } from "./transformer.js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { SourcePlugin } from "../../../shared/types/sourcePlugin.js";

// function x<T extends { new (...args: any[]): any }>(c: T) {
//   console.log("Decorator invoked by", c);
// }

// @x
export class Saavn implements SourcePlugin {
  name = "SAAVN";

  iv = util.createBuffer("00000000");
  key = util.createBuffer("38346591");
  baseAPI = "https://www.jiosaavn.com/api.php?api_version=4&_format=json&_marker=0&ctx=web6dot0";

  async init() {
    return this;
  }

  url(endPoint: string, params: Record<string, string | number>) {
    const url = new URL(`${this.baseAPI}${endPoint}`);
    for (const [K, V] of Object.entries(params)) url.searchParams.append(K, V.toString());
    return url.toString();
  }

  createDownloadLink(encryptedMediaUrl: string) {
    const decipher = cipher.createDecipher("DES-ECB", this.key);
    const encrypted = util.createBuffer(atob(encryptedMediaUrl));
    decipher.start({ iv: this.iv });
    decipher.update(encrypted);
    decipher.finish();

    return decipher.output.getBytes().replace("_96", "_320");
  }

  async fetchChunks(url: string) {
    const perChunk = 30;
    const maxCount = 300;
    const { data } = await axios(url + "&n=" + maxCount);
    const chunksCount = Math.ceil(Math.min(data.total, maxCount) / perChunk);
    return await Promise.all(
      Array.from({ length: chunksCount }, (_, i) =>
        axios(`${url}&n=${perChunk}&p=${i + 1}`).catch(() => ({ data: { results: [] } })),
      ),
    );
  }

  async searchTracks(query: string) {
    const results = await this.fetchChunks(`${this.baseAPI}&__call=search.getResults&q=${query}`);
    return results.map((res) => Transformers.track(res.data.results)).flat();
  }

  async searchAlbums(query: string) {
    const results = await this.fetchChunks(`${this.baseAPI}&__call=search.getAlbumResults&q=${query}`);
    return results.map((res) => Transformers.album(res.data.results)).flat();
  }

  async searchArtists(query: string) {
    const res = await this.fetchChunks(`${this.baseAPI}&__call=search.getArtistResults&q=${query}`);
    return res.map((r) => r.data).flat() as any;
  }

  async searchPlaylists(query: string) {
    const res = await this.fetchChunks(`${this.baseAPI}&__call=search.getPlaylistResults&q=${query}`);
    return res.map((r) => r.data).flat() as any;
  }

  async getTrack(id: string) {
    const res = await axios(`${this.baseAPI}&__call=song.getDetails&pids=${id}`);
    return { uri: this.createDownloadLink(res.data.songs[0].more_info.encrypted_media_url), ext: "m4a", direct: true };
  }

  async getAlbum(id: string) {
    const res = await axios(`${this.baseAPI}&__call=content.getAlbumDetails&albumid=${id}`);
    return res.data;
  }

  async getArtist(id: string) {
    id;
    return null as any;
  }

  async getPlaylist(id: string) {
    id;
    return null as any;
  }
}

const saavn = await new Saavn().init();
const dir = path.resolve(fileURLToPath(import.meta.url), "../res");
if (!existsSync(path.resolve(dir))) mkdirSync(path.resolve(dir));
// writeFileSync(path.resolve(dir, "search.json"), JSON.stringify(await saavn.searchTracks("skyfall")));
// writeFileSync(path.resolve(dir, "album.json"), JSON.stringify(await saavn.searchAlbums("skyfall")));
// writeFileSync(path.resolve(dir, "artist.json"), JSON.stringify(await saavn.searchArtists("the weeknd")));
writeFileSync(path.resolve(dir, "playlist.json"), JSON.stringify(await saavn.searchPlaylists("arijit singh mix")));

// const x = (await import("./res/search.json")).default;
// console.log(x.length);
