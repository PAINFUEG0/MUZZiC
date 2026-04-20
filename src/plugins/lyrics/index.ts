import { Lrclib } from "./source/lrclib.js";
import { AppleMusic } from "./source/apple.js";
import { SourcePlugin } from "../../shared/types/sourcePlugin.js";

type BaseArguments = { isrc?: string; title: string; artist: string; album?: string; duration?: number };

export class LyricsFetcher {
  #lrclib = new Lrclib();
  #apple = new AppleMusic();
  #sourcePlugins = new Map<string, SourcePlugin>();

  constructor(sourcePlugins: SourcePlugin[]) {
    for (const plugin of sourcePlugins) this.#sourcePlugins.set(plugin.name, plugin);
  }

  async init() {
    await this.#apple.init();
    await this.#lrclib.init();
    return this;
  }

  async getLyrics(op: BaseArguments | (BaseArguments & { platformId: string; platformName: string })) {
    let platformLyrics;

    if ("platformId" in op) platformLyrics = await this.#sourcePlugins.get(op.platformName)?.getLyrics?.(op.platformId);
    if (platformLyrics && platformLyrics.syncType !== "None") return platformLyrics;

    const lrcLibLyrics = await this.#lrclib.getLyrics(op);
    if (lrcLibLyrics && lrcLibLyrics.syncType !== "None") return lrcLibLyrics;

    const appleMusicLyrics = await this.#apple.getLyrics(op);
    if (appleMusicLyrics && appleMusicLyrics.syncType !== "None") return appleMusicLyrics;

    return platformLyrics || lrcLibLyrics || appleMusicLyrics;
  }
}
