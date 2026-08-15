/** @format */

const syncedDotRegex = /^\[(\d{2}):(\d{2})\.(\d{1,3})\]/m;
const syncedColonRegex = /^\[(\d{2}):(\d{2}):(\d{2,3})\]/m;

const fmt = (str: string) =>
  str
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !isMetadata(l));

function probe(lrc: string): "unsynced" | "colon" | "dot" {
  const lines = fmt(lrc);

  if (lines.every((l) => syncedDotRegex.test(l))) return "dot";
  else if (lines.every((l) => syncedColonRegex.test(l))) return "colon";
  else return "unsynced";
}

const metadataRegex = /^\[(?:ar|ti|al|by|re|ve|offset):/i;

function isMetadata(line: string) {
  return metadataRegex.test(line.trim());
}

export function parseLRC(lrc: string) {
  const type = probe(lrc);

  if (type === "unsynced")
    return {
      syncType: "None",
      leadingSilence: 0,
      lines: fmt(lrc).map((line) => ({ start: 0, end: 10e10, text: line.trim() || "..." })),
    } as const;

  const lines = fmt(lrc)
    .map((line) => {
      const match = line.match(type === "dot" ? syncedDotRegex : syncedColonRegex);

      return {
        text: match!.input?.replace(match![0], "")?.trim() || "...",
        start: parseInt(match![1]!, 10) * 60_000 + parseInt(match![2]!, 10) * 1_000 + Math.round(parseInt(match![3]!, 10) * (match![3]!.length === 2 ? 10 : 1)),
      };
    })
    .map(({ start, text }, i, arr) => ({ start, text, end: arr[i + 1]?.start ?? 10e10 }));

  return { lines, syncType: "Line", leadingSilence: lines[0]?.start ?? 0 } as const;
}
