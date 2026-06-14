/** @format */

import axios from "axios";
import { Transformers } from "./transformer.js";
import { formats } from "../../../shared/constants.js";
import { parseLRC } from "../../lyrics/transformers/lrc.js";
import type { SourcePlugin } from "../../../shared/types/sourcePlugin.js";

export class Tidal implements SourcePlugin {
  name = "TIDAL";

  #searchApi!: string;
  #transformer = new Transformers();
  #streamApi!: { url: string; version: string };

  async init() {
    await Promise.all([this.#fetchSearchAPI(), this.#fetchStreamAPI()]);
    return this;
  }

  async #retry<T>(task: () => Promise<T>, query?: string): Promise<T> {
    return task().catch(() => this.#fetchSearchAPI(query).then(task));
  }

  async #search<T>(query: string, type: "s" | "p" | "a" | "al", transform: (data: any) => T) {
    return this.#retry(() => axios(`${this.#searchApi}/search?${type}=${query.trim()}`), query).then((r) => transform(r.data));
  }

  async searchTracks(query: string) {
    return this.#search(query, "s", (d) => this.#transformer.track(d.data.items));
  }

  async searchAlbums(query: string) {
    return this.#search(query, "al", (d) => this.#transformer.album(d.data.albums.items));
  }

  async searchArtists(query: string) {
    return this.#search(query, "a", (d) => this.#transformer.artist(d.data.artists.items));
  }

  async searchPlaylists(query: string) {
    return this.#search(query, "p", (d) => this.#transformer.playlist(d.data.playlists.items));
  }

  async getLyrics(id: string) {
    const res = await axios(`${this.#streamApi}/lyrics?id=${id}`);
    if (!res.data.lyrics.subtitles && !res.data.lyrics.lyrics) return;
    return parseLRC(res.data.lyrics.subtitles || res.data.lyrics.lyrics);
  }

  async getTrack(id: string, quality: keyof typeof formats = "HIGH") {
    const mpd = !["LOW", "HIGH"].includes(quality);

    const url = !mpd
      ? `${this.#streamApi.url}/track?id=${id}&quality=${quality}`
      : `${this.#streamApi.url}/trackManifests?id=${id}&formats=${formats[quality].format}`;

    const res = await axios(url).catch(() => this.#fetchStreamAPI(id).then(() => axios(url)));
    const uri = mpd ? res.data.data.data.attributes.uri : JSON.parse(atob(res.data.data.manifest)).urls[0]!;

    return { uri, ext: formats[quality].ext, direct: !mpd };
  }

  async getAlbum(id: string) {
    const res = await this.#retry(() => axios(`${this.#searchApi}/album?id=${id}`), id);
    const intermediate = {
      ...this.#transformer.album([res.data.data])[0]!,
      tracks: this.#transformer.track(res.data.data.items.map((i: any) => i.item)),
    };
    return { ...intermediate, duration: intermediate.tracks.reduce((a, b) => a + b.duration, 0) };
  }

  async getArtist(id: string) {
    const res = await this.#retry(
      () => Promise.all([axios(`${this.#searchApi}/artist?id=${id}`), axios(`${this.#searchApi}/artist?f=${id}`)]),
      id,
    );

    return {
      tracks: this.#transformer.track(res[1].data.tracks),
      ...this.#transformer.artist([res[0].data.artist])[0]!,
      albums: this.#transformer.album(res[1].data.albums.items),
    };
  }

  async getPlaylist(id: string) {
    const res = await this.#retry(() => axios(`${this.#searchApi}/playlist?id=${id}`), id);
    return { ...this.#transformer.playlist([res.data.playlist])[0]!, tracks: this.#transformer.track(res.data.items) };
  }

  async #fetchAPIs() {
    return await axios<{
      api: { url: string; version: string }[];
      streaming: { url: string; version: string }[];
      down: { url: string; status: number; error: string }[];
    }>("https://tidal-uptime.props-76styles.workers.dev");
  }

  async #fetchSearchAPI(query = "skyfall") {
    const APIs = await this.#fetchAPIs();

    return (this.#searchApi = await Promise.any(
      APIs.data.api.map(async (api) => {
        const { data } = await axios(`${api.url}/search?s=${query}`);
        if (data?.data?.items) return api.url;
        throw 0;
      }),
    ));
  }

  async #fetchStreamAPI(id = "201802681") {
    const APIs = await this.#fetchAPIs();

    return (this.#streamApi = await Promise.any(
      [...APIs.data.streaming, ...APIs.data.api, ...APIs.data.down].map(async (api) => {
        const { data } = await axios(`${api.url}/track?id=${id}`);
        if (!data?.data?.manifest) throw 0;
        if ("version" in api) return api;
        return { url: api.url, version: await axios(`${api.url}`).then((r) => r.data.version) };
      }),
    ));
  }
}
