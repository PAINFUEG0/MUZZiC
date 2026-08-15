/** @format */

import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  textNodeName: "#text",
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["div", "p", "span"].includes(name),
});
const parseEntity = (e: any) => ({ end: time(e["@_end"]), start: time(e["@_begin"]), text: `${e["#text"] || "..."}` as string }) as const;

function time(raw: string) {
  let res = 0;
  if (!raw) return res;
  const parts = raw.split(":");
  if (parts.length === 3) res = parseInt(parts[0]!) * 3600 + parseInt(parts[1]!) * 60 + parseFloat(parts[2]!);
  else if (parts.length === 2) res = parseInt(parts[0]!) * 60 + parseFloat(parts[1]!);
  else res = parseFloat(raw);
  return Math.round(res * 1000);
}

const toArray = <T>(val: T | T[]) => (Array.isArray(val) ? val : val === undefined || val === null ? [] : [val]);

export function parseTTML(ttml: string) {
  const tt = parser.parse(ttml)["tt"];
  const divs = toArray(tt?.body?.div);
  const syncType = (tt?.["@_itunes:timing"] ?? tt?.["@_timing"] ?? "None") as "None" | "Word" | "Line";

  switch (syncType) {
    case "Line": {
      const lines = divs.flatMap((div) => toArray(div.p).map(parseEntity));
      return { syncType, leadingSilence: lines[0]?.start ?? 0, lines };
    }

    case "Word": {
      const lines = divs
        .flatMap((div) => toArray(div.p).map((p) => toArray(p.span).map(parseEntity)))
        .map((line) => ({ start: line[0]!.start, end: line[line.length - 1]!.end, text: line.map((l) => l.text).join(" ") }));
      return { syncType: "Line" as const, leadingSilence: lines[0]?.start ?? 0, lines };
    }

    case "None": {
      const lines = divs.flatMap((div) => toArray(div.p).map((p) => ({ start: 0 as number, end: 10e10 as number, text: `${p}` as string }) as const));
      return { syncType, leadingSilence: lines[0]?.start ?? 0, lines };
    }
  }
}
