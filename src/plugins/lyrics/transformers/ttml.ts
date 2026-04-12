import { XMLParser } from "fast-xml-parser";
import { LineSync, Lyrics, WordSync } from "../../../shared/types/lyrics.js";

export class TTMLTransformer {
  static emptyLinePlaceholder = ". . .";

  static parser = new XMLParser({
    textNodeName: "#text",
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => ["div", "p", "span"].includes(name),
  });

  static parseEntity(entity: any) {
    return {
      end: this.parseTime(entity["@_end"]),
      start: this.parseTime(entity["@_begin"]),
      text: entity["#text"] || this.emptyLinePlaceholder,
    };
  }

  static parseFromTTML(ttml: string): Lyrics<true | false> {
    const lines = <any[]>[];
    const tt = this.parser.parse(ttml)["tt"];
    const divs = this.toArray(tt?.body?.div);
    const itunesMeta = tt?.head?.metadata?.["iTunesMetadata"];
    const timingMode = tt?.["@_itunes:timing"] ?? tt?.["@_timing"] ?? "None";
    const leadingSilence = parseFloat(itunesMeta?.["@_leadingSilence"] ?? "0") || 0;
    const transliterationAvailable = this.toArray(itunesMeta?.translations?.translation).length > 0;

    for (const div of divs)
      for (const p of this.toArray(div.p))
        switch (timingMode) {
          case "Line":
            lines.push(this.parseEntity(p));
            break;

          case "Word":
            const words = [];
            for (const span of this.toArray(p.span)) words.push(this.parseEntity(span));
            words.length && lines.push(words);
            break;

          case "None":
            lines.push({ start: 0, end: 0, text: p || this.emptyLinePlaceholder });
            break;
        }

    return { wordSynced: timingMode === "Word", lines, leadingSilence, transliterationAvailable };
  }

  static parseTime(raw: string) {
    let res = 0;
    if (!raw) return res;
    const parts = raw.split(":");
    if (parts.length === 3) res = parseInt(parts[0]!) * 3600 + parseInt(parts[1]!) * 60 + parseFloat(parts[2]!);
    else if (parts.length === 2) res = parseInt(parts[0]!) * 60 + parseFloat(parts[1]!);
    else res = parseFloat(raw);
    return res * 1000;
  }

  static toArray = <T>(val: T | T[]) => (Array.isArray(val) ? val : val === undefined || val === null ? [] : [val]);

  static parseToTTML(lyrics: Lyrics<true | false>): string {
    const timingMode = lyrics.wordSynced
      ? "Word"
      : lyrics.lines.some((l) => (l as LineSync).start > 0)
        ? "Line"
        : "None";

    const divContent = lyrics.wordSynced
      ? (lyrics.lines as WordSync[]).map((words) => this.buildWordParagraph(words)).join("\n        ")
      : (lyrics.lines as LineSync[]).map((line) => this.buildLineParagraph(line, timingMode)).join("\n        ");

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<tt \n` +
      `  xml:lang="en"\n` +
      `  xmlns="http://www.w3.org/ns/ttml"\n` +
      `  xmlns:ttm="http://www.w3.org/ns/ttml#metadata"\n` +
      `  xmlns:itunes="http://music.apple.com/lyric-ttml-internal"\n` +
      `  itunes:timing="${timingMode}"\n` +
      `>\n` +
      `  <head>\n` +
      `    <metadata>\n` +
      `      <iTunesMetadata leadingSilence="${lyrics.leadingSilence / 1000}">\n` +
      `        ${lyrics.transliterationAvailable ? "<translations><translation /></translations>" : ""}\n` +
      `      </iTunesMetadata>\n` +
      `    </metadata>\n` +
      `  </head>\n` +
      `  <body>\n` +
      `    <div>\n` +
      `        ${divContent}\n` +
      `    </div>\n` +
      `  </body>\n` +
      `</tt>`
    );
  }

  private static buildLineParagraph(line: LineSync, timingMode: string): string {
    const attrs =
      timingMode === "Line" ? ` begin="${this.formatTime(line.start)}" end="${this.formatTime(line.end)}"` : "";
    const text = line.text === this.emptyLinePlaceholder ? "" : this.escapeXML(line.text);
    return `<p${attrs}>${text}</p>`;
  }

  private static buildWordParagraph(words: WordSync): string {
    if (!words.length) return "";
    const begin = this.formatTime(words[0]!.start);
    const end = this.formatTime(words[words.length - 1]!.end);
    const spans = words
      .map(
        (w) =>
          `<span begin="${this.formatTime(w.start)}" end="${this.formatTime(w.end)}">${this.escapeXML(w.text)}</span>`,
      )
      .join(" ");
    return `<p begin="${begin}" end="${end}">${spans}</p>`;
  }

  private static formatTime(ms: number): string {
    const totalSeconds = ms / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${seconds}`;
  }

  private static escapeXML(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}
