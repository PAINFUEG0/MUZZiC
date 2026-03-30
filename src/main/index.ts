import axios from "axios";
import { spawn } from "child_process";
import { Tidal } from "../plugins/index.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";

console.clear();

existsSync("./tracks") || mkdirSync("./tracks");

const tidal = new Tidal();

await tidal.init();

const tracks = await tidal.searchTracks("jid surround sound");

const track = tracks
  // [0]!;
  .find((t) => t.resolution == "DD")!;

const priority: string = "ATMOS";

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

if (res.direct)
  writeFileSync(
    `./tracks/${track.title}-( ${format} ).${res.ext}`,
    Buffer.from(await (await axios(res.uri, { responseType: "arraybuffer" })).data),
  );
else
  await new Promise<boolean>((resolve, reject) =>
    spawn(
      "yt-dlp",
      [
        "-o",
        `./tracks/${track.title}-( ${format} ).${res.ext}`,
        "--no-check-certificates",
        "--concurrent-fragments",
        "20",
        res.uri,
      ],
      { stdio: "inherit" },
    )
      .on("close", resolve)
      .on("error", reject),
  );

writeFileSync(
  `./tracks/${track.title}-( ${format} ).jpg`,
  Buffer.from(await (await axios(track.thumb, { responseType: "arraybuffer" })).data),
);
