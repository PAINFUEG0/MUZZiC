import { AppleMusic } from "./source/apple.js";
import { LRCTransformer } from "./transformers/lrc.js";
import { TTMLTransformer } from "./transformers/ttml.js";
import { SourcePlugin } from "../../shared/types/sourcePlugin.js";

export class LyricsFetcher {
  appleMusicPlugin!: AppleMusic;
  plugins: SourcePlugin[];

  constructor(plugins: SourcePlugin[]) {
    this.plugins = plugins;
  }

  async init() {
    this.appleMusicPlugin = await new AppleMusic().init();
  }

  async fetchLyrics(source: SourcePlugin["name"], platformId: string, title: string, artist: string, isrc?: string) {
    const sourceLyrics = await this.plugins.find((p) => p.name === source)?.getLyrics?.(platformId);

    if (sourceLyrics?.synced)
      return sourceLyrics.type === "LRC"
        ? LRCTransformer.parseFromLRC(sourceLyrics.raw)
        : TTMLTransformer.parseFromTTML(sourceLyrics.raw);

    const appleLyrics = await this.appleMusicPlugin.getLyrics({ title, artist, isrc });

    return appleLyrics
      ? TTMLTransformer.parseFromTTML(appleLyrics)
      : sourceLyrics
        ? {
            wordSynced: false,
            leadingSilence: 0,
            transliterationAvailable: false,
            lines: sourceLyrics.raw
              .split("\n")
              .filter((l) => l.trim())
              .map((l) => ({ text: l, start: 0, end: 0 })),
          }
        : null;
  }
}
