import axios from "axios";
import { spawn } from "node:child_process";
import { Tidal } from "../plugins/index.js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

console.clear();

existsSync("./tracks") || mkdirSync("./tracks");

const tidal = new Tidal();

await tidal.init();

const tracks = await tidal.searchTracks("no idea don troliver");

const track = tracks.find((t) => t.resolution === "HR")!;

const priority: string = "LOSSLESS";

const format =
  track.resolution === "HR"
    ? "HIRES_LOSSLESS"
    : track.resolution === "CD"
      ? "LOSSLESS"
      : track.resolution === "DD"
        ? priority === "LOSSLESS"
          ? "LOSSLESS"
          : "ATMOS"
        : "HIGH";

const res = await tidal.getTrack(track.id, format);
const name = `${sanitizeTrackName(track.title)}-( ${format} )`;

if (res.direct)
  writeFileSync(
    `./tracks/${name}.${res.ext}`,
    Buffer.from(await (await axios(res.uri, { responseType: "arraybuffer" })).data),
  );
else
  await new Promise<boolean>((resolve, reject) =>
    spawn(
      process.env.DLP!,
      ["-o", `./tracks/${name}.${res.ext}`, "--no-check-certificates", "--concurrent-fragments", "20", res.uri],
      { stdio: "inherit" },
    )
      .on("close", resolve)
      .on("error", reject),
  );

writeFileSync(`./tracks/${name}.jpg`, Buffer.from((await axios(track.thumb, { responseType: "arraybuffer" })).data));

export function sanitizeTrackName(input: string) {
  let name = input;
  const maxLength = 120;
  const replacement = " ";

  name = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  name = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, replacement);
  name = name.replace(/\s+/g, " ").trim();

  if (name.length > maxLength) name = name.slice(0, maxLength).trim();

  return name || "track";
}
