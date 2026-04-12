import { LyricsFetcher, Tidal } from "../plugins/index.js";
import { LRCTransformer } from "../plugins/lyrics/transformers/lrc.js";
import { TTMLTransformer } from "../plugins/lyrics/transformers/ttml.js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const tidal = new Tidal();
await tidal.init();

const lyricsFetcher = new LyricsFetcher([tidal]);

await lyricsFetcher.init();

const raw = (await lyricsFetcher.fetchLyrics("", "0", "no idea", "don troliver"))!;

existsSync("./lyrics") || mkdirSync("./lyrics");

const ttml = TTMLTransformer.parseToTTML(raw);

const json = TTMLTransformer.parseFromTTML(ttml);

const lrc = LRCTransformer.parseToLRC(json);

const _json = LRCTransformer.parseFromLRC(lrc);

for (const t of [
  { name: "RAW.json", data: JSON.stringify(raw) },
  { name: "TTML.ttml", data: ttml.toString() },
  { name: "JSON.json", data: JSON.stringify(json) },
  { name: "LRC.lrc", data: lrc.toString() },
  { name: "JSON.json", data: JSON.stringify(_json) },
])
  writeFileSync(`./lyrics/${t.name}`, t.data);
