import { LyricsFetcher, Tidal } from "../plugins/index.js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { Transformer } from "../plugins/lyrics/transformers/lrc.js";
import { TTMLTransformer } from "../plugins/lyrics/transformers/ttml.js";

const tidal = new Tidal();
await tidal.init();

const lyricsFetcher = new LyricsFetcher([tidal]);

await lyricsFetcher.init();

const raw = (await lyricsFetcher.fetchLyrics("", "0", "ATTRACTION", "SUKHA PRODGK"))!;

existsSync("./lyrics") || mkdirSync("./lyrics");

const ttml = TTMLTransformer.parseToTTML(raw);

const json = TTMLTransformer.parseFromTTML(ttml);

const lrc = Transformer.parseToLRC(json);

const _json = Transformer.parseLRC(lrc);

for (const t of [
  { name: "LRC.lrc", data: lrc.toString() },
  { name: "TTML.ttml", data: ttml.toString() },
  { name: "RAW.json", data: JSON.stringify(raw) },
  { name: "JSON.json", data: JSON.stringify(json) },
  { name: "JSON.json", data: JSON.stringify(_json) },
])
  writeFileSync(`./lyrics/${t.name}`, t.data);
