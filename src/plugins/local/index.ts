import path from "node:path";
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { scanAudioDir } from "./helpers/scanDir.js";
import { buildThumbs } from "./helpers/extractCover.js";
import { fallbackImage } from "../../shared/constants.js";
import { Track } from "../../shared/types/sourcePlugin.js";
import { extractAudioMetadata } from "./helpers/extractMetadata.js";

const dir = "D:/Projects/AMDL";

const tree = scanAudioDir(dir);
writeFileSync("./.tree.json", JSON.stringify(tree || {}, null, 2));

const file = "D:\\Projects\\AMDL\\downloads\\Favorite Songs\\52. Sodium.m4a";
// "D:\\Music\\(◡︵◡)\\Alec Benjamin - Let Me Down Slowly [Official Music Video].flac";

const meta = await extractAudioMetadata(file);

const fileId = createHash("sha1").update(file).digest("hex").toString();
const albumId = createHash("sha1").update(meta.album).digest("hex").toString();

const thumb = await buildThumbs(file, albumId).catch(() => fallbackImage);

const track = {
  thumb,
  id: fileId,
  streamURI: file,
  duration: meta.duration,
  explicit: meta.explicit,
  lyrics: "No lyrics found",
  resolution: meta.resolution,
  title: path.basename(file, path.extname(file)),
  album: { name: meta.album, id: albumId, thumb },
  artists: meta.artists.map((a) => ({
    name: a,
    thumb: fallbackImage,
    id: createHash("sha1").update(a).digest("hex").toString(),
  })),
} satisfies Track<true>;

console.log(track);
