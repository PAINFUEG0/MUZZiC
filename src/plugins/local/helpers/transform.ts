import path from "node:path";
import { createHash } from "node:crypto";
import { extractCover } from "./extractCover.js";
import { File } from "../../../shared/types/utils.js";
import { extractAudioMetadata } from "./extractMetadata.js";
import { fallbackImage } from "../../../shared/constants.js";
import { Track } from "../../../shared/types/sourcePlugin.js";

export async function transform(file: File) {
  const meta = await extractAudioMetadata(file.path);
  const albumId = createHash("sha1").update(meta.album).digest("hex").toString();
  const thumb = await extractCover(file.path, albumId).catch(() => fallbackImage);

  return {
    thumb,
    id: file.id,
    streamURI: file.path,
    explicit: meta.explicit,
    duration: meta.duration,
    lyrics: "No lyrics found",
    resolution: meta.resolution,
    album: { name: meta.album, id: albumId, thumb },
    title: path.basename(file.path, path.extname(file.path)),
    artists: meta.artists.map((a) => ({
      name: a,
      thumb: fallbackImage,
      id: createHash("sha1").update(a).digest("hex").toString(),
    })),
  } satisfies Track<true>;
}
