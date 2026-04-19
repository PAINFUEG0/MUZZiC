import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  textNodeName: "#text",
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["div", "p", "span"].includes(name),
});

export function parseTTML(ttml: string) {
  const tt = parser.parse(ttml)["tt"];
  const divs = toArray(tt?.body?.div);
  const type = tt?.["@_itunes:timing"] ?? tt?.["@_timing"] ?? "None";

  const lines =
    type === "None"
      ? divs.map((div) => toArray(div.p).map((p) => ({ start: 0, end: 10e10, text: p }))).flat()
      : type === "Word"
        ? divs.map((div) => toArray(div.p).map((p) => toArray(p.span).map(parseEntity))).flat()
        : divs.map((div) => toArray(div.p).map(parseEntity)).flat();

  return { leadingSilence: ("start" in lines[0]! ? lines[0]!.start : lines[0]![0]!.start) ?? 0, type, lines };
}

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

const parseEntity = (e: any) => ({ end: time(e["@_end"]), start: time(e["@_begin"]), text: e["#text"] || "..." });
