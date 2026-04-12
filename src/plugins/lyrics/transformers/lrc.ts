import { LineSync, Lyrics } from "../../../shared/types/lyrics.js";

export class LRCTransformer {
  static emptyLinePlaceholder = ". . .";

  static timestampRegex = /^\[(\d{2}):(\d{2}\.\d+)\](.*)/;

  static parseFromLRC(lrc: string): Lyrics {
    let lines: any[] = lrc.split("\n").map((l) => l.trim());

    lines = lines
      .map((line) => {
        const match = line.match(this.timestampRegex);
        if (match)
          return {
            text: match[3]!.trim() || this.emptyLinePlaceholder,
            time: Math.round((parseInt(match[1]!, 10) * 60 + parseFloat(match[2]!)) * 1000),
          };
      })
      .filter(Boolean);

    lines = lines.map((entry, i) => ({
      start: entry.time,
      text: entry.text || this.emptyLinePlaceholder,
      end: lines[i + 1]?.time ?? entry.time + 10e10,
    }));

    return { lines, wordSynced: false, transliterationAvailable: false, leadingSilence: lines[0]?.time ?? 0 };
  }

  static parseToLRC(lyrics: Lyrics<false>): string {
    const lines = lyrics.lines as LineSync[];

    const body = lines
      .filter((l) => l.text !== this.emptyLinePlaceholder)
      .map((l) => `[${this.formatTimestamp(l.start)}]${l.text}`)
      .join("\n");

    const last = lines.at(-1);
    const closing = last && last.end < 10e10 ? `\n[${this.formatTimestamp(last.end)}]` : "";

    return body + closing;
  }

  static formatTimestamp(ms: number): string {
    const totalSeconds = ms / 1000;
    const min = Math.floor(totalSeconds / 60);
    const sec = (totalSeconds % 60).toFixed(2).padStart(5, "0");
    return `${String(min).padStart(2, "0")}:${sec}`;
  }
}
