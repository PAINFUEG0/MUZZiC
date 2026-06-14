/** @format */

import axios from "axios";
import { util, cipher } from "node-forge";
import { Transformers } from "./transformer.js";
import type { SourcePlugin } from "../../../shared/types/sourcePlugin.js";

export class Saavn implements SourcePlugin {
  name = "SAAVN";

  #transformer = new Transformers();
  #iv = util.createBuffer("00000000");
  #key = util.createBuffer("38346591");
  #baseAPI = "https://www.jiosaavn.com/api.php?api_version=4&_format=json&_marker=0&ctx=web6dot0";

  async init() {
    return this;
  }

  url(endPoint: string, params: Record<string, string | number>) {
    const url = new URL(`${this.#baseAPI}${endPoint}`);
    for (const [K, V] of Object.entries(params)) url.searchParams.append(K, V.toString());
    return url.toString();
  }

  createDownloadLink(encryptedMediaUrl: string) {
    const decipher = cipher.createDecipher("DES-ECB", this.#key);
    const encrypted = util.createBuffer(atob(encryptedMediaUrl));
    decipher.start({ iv: this.#iv });
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
      Array.from({ length: chunksCount }, (_, i) => axios(`${url}&n=${perChunk}&p=${i + 1}`).catch(() => ({ data: { results: [] } }))),
    );
  }

  async searchTracks(query: string) {
    const results = await this.fetchChunks(`${this.#baseAPI}&__call=search.getResults&q=${query}`);
    return results.map((res) => this.#transformer.track(res.data.results)).flat();
  }

  async searchAlbums(query: string) {
    const results = await this.fetchChunks(`${this.#baseAPI}&__call=search.getAlbumResults&q=${query}`);
    return results.map((res) => this.#transformer.album(res.data.results)).flat();
  }

  async searchArtists(query: string) {
    const res = await this.fetchChunks(`${this.#baseAPI}&__call=search.getArtistResults&q=${query}`);
    return res.map((r) => this.#transformer.artist(r.data.results)).flat();
  }

  async searchPlaylists(query: string) {
    const res = await this.fetchChunks(`${this.#baseAPI}&__call=search.getPlaylistResults&q=${query}`);
    return res.map((r) => this.#transformer.playlist(r.data.results)).flat();
  }

  async getTrack(id: string) {
    const res = await axios(`${this.#baseAPI}&__call=song.getDetails&pids=${id}`);
    return { uri: this.createDownloadLink(res.data.songs[0].more_info.encrypted_media_url), ext: "m4a", direct: true };
  }

  async getAlbum(id: string) {
    const res = await axios(`${this.#baseAPI}&__call=content.getAlbumDetails&albumid=${id}`);
    const intermediate = { ...this.#transformer.album([res.data])[0]!, tracks: this.#transformer.track(res.data.list) };
    return { ...intermediate, duration: intermediate.tracks.reduce((a, b) => a + b.duration, 0) };
  }

  async getArtist(id: string) {
    const url = `${this.#baseAPI}&__call=artist.getArtistPageDetails&artistId=${id}`;

    const albums = (
      await Promise.all(
        Array.from({ length: 1000 / 10 }, (_, i) => axios(`${url}&n_album=${10}&page=${i + 1}`).then((res) => res.data.topAlbums)),
      )
    ).flat();

    const tracks = (
      await Promise.all(
        Array.from({ length: 1500 / 50 }, (_, i) => axios(`${url}&n_song=${50}&page=${i + 1}`).then((res) => res.data.topSongs)),
      )
    ).flat();

    const { data } = await axios(`${this.#baseAPI}&__call=artist.getArtistPageDetails&artistId=${id}&n_song=1000`);

    return { ...this.#transformer.artist([data])[0]!, tracks: this.#transformer.track(tracks), albums: this.#transformer.album(albums) };
  }

  async getPlaylist(id: string) {
    const res = await axios(`${this.#baseAPI}&__call=playlist.getDetails&listid=${id}`);
    const intermediate = { ...this.#transformer.playlist([res.data])[0]!, tracks: this.#transformer.track(res.data.list) };
    return { ...intermediate, duration: intermediate.tracks.reduce((a, b) => a + b.duration, 0) };
  }
}
