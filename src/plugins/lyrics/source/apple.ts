/** @format */

import axios from "axios";
import { parseTTML } from "../transformers/ttml.js";
import { safeAwait } from "../../../shared/helpers.js";
import { mediaToken } from "../../../shared/config.js";
import { Lyrics, LyricsPlugin } from "../../../shared/types/lyrics.js";

export class AppleMusic implements LyricsPlugin {
  #authToken = "";
  #mediaToken = mediaToken;

  get headers() {
    return {
      Origin: "https://music.apple.com",
      Referer: "https://music.apple.com",
      "media-user-token": this.#mediaToken,
      Authorization: `Bearer ${this.#authToken}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    };
  }

  async init() {
    const html = (await axios("https://music.apple.com/", { responseType: "text" })).data;
    const scriptTagMatch = html.match(/<script type="module" crossorigin src="(\/assets\/index[^"]+\.js)"><\/script>/);

    const scriptUrl = new URL(scriptTagMatch![1]!, "https://music.apple.com/").toString();
    const jsContent = (await axios(scriptUrl, { responseType: "text" })).data;

    const tokenVarMatch = jsContent.match(/e\.headers\.Authorization\s*=\s*`Bearer \${(.*?)}`/);
    this.#authToken = jsContent.match(new RegExp(`const ${tokenVarMatch![1]}\\s*=\\s*"([^"]+)"`))![1]!;
    return this;
  }

  async search(query: string, limit = 50, offset = 0) {
    const uri = `https://amp-api.music.apple.com/v1/catalog/id/search?types=songs&term=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
    const [res] = await safeAwait(axios(uri, { headers: this.headers }));
    return res ? (res.data?.results?.songs?.data as any[]) : null;
  }

  async getLyrics(op: { title: string; artist: string; album?: string; duration?: number; isrc?: string }) {
    const id =
      "appleMusicPlatformId" in op
        ? op.appleMusicPlatformId
        : await (async () => {
            const tracks = await this.search(`${op.artist} ${op.title}`);
            if (!tracks) return;

            const bestMatch = op.isrc ? tracks.find((t) => t.isrc === op.isrc) : tracks[0];
            return bestMatch?.id;
          })();

    if (!id) return;

    const uri = `https://amp-api.music.apple.com/v1/catalog/id/songs/${id}/syllable-lyrics?l%5Blyrics%5D=en-US&extend=ttmlLocalizations&l%5Bscript%5D=en-Latn`;
    const [res, err] = await safeAwait(axios(uri, { headers: this.headers }));
    const raw = res?.data?.data?.[0]?.attributes?.ttmlLocalizations;

    return raw || !err ? (parseTTML(raw) as Lyrics<"Line"> | Lyrics<"Word"> | Lyrics<"None">) : undefined;
  }
}
