import axios from "axios";
import { safeAwait } from "../../../shared/helpers.js";
import { LyricsPlugin } from "../../../shared/types/lyrics.js";
import { parseLRC } from "../transformers/lrc.js";

export class Lrclib implements LyricsPlugin {
  async init() {
    return this;
  }

  async getLyrics(op: { title: string; artist: string; album?: string; duration?: number }) {
    const url = new URL(`https://lrclib.net/api/get`);

    url.searchParams.append("track_name", op.title);
    url.searchParams.append("artist_name", op.artist);
    op.album && url.searchParams.append("album_name", op.album);
    op.duration && url.searchParams.append("duration", op.duration.toString());

    const [res, err] = await safeAwait(axios(url.toString()));

    if (err) return;

    return parseLRC(res.data.syncedLyrics || res.data.plainLyrics);
  }
}
