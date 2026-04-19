const syncedDotRegex = /^\[(\d{2}):(\d{2})\.(\d{1,3})\]/m;
const syncedColonRegex = /^\[(\d{2}):(\d{2}):(\d{2,3})\]/m;

function probe(lrc: string): "unsynced" | "colon" | "dot" {
  const lines = lrc.split("\n").filter((l) => !!l.trim());

  if (lines.every((l) => syncedDotRegex.test(l))) return "dot";
  else if (lines.every((l) => syncedColonRegex.test(l))) return "colon";
  else return "unsynced";
}

export function parseLRC(lrc: string) {
  const type = probe(lrc);

  let lines = lrc
    .split("\n")
    .map((line) => {
      if (type === "unsynced") return { start: 0, end: 10e10, text: line.trim() || "..." };

      const match = line.match(type === "dot" ? syncedDotRegex : syncedColonRegex);

      return {
        time:
          parseInt(match![1]!, 10) * 60_000 +
          parseInt(match![2]!, 10) * 1000 +
          Math.round(parseInt(match![3]!, 10) * (match![3]!.length === 2 ? 10 : 1)),
        text: match!.input?.replace(match![0], "")?.trim() || "...",
      };
    })
    .map((line, i, arr) => ({ start: line.time, text: line.text, end: arr[i + 1]?.time ?? 10e10 }));

  return { lines, syncType: "Line", leadingSilence: lines[0]?.start ?? 0 };
}
