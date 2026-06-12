import path from "node:path";
import { probe } from "./probe";
import { File } from "../../shared/types/utils";
import { Track } from "../../shared/types/sourcePlugin";

export function transform(file: File<true>, metadata: Awaited<ReturnType<typeof probe>>) {
  return {
    id: file.id,
    streamURI: file.path,
    thumb: `${file.id}.jpg`,
    explicit: metadata.explicit,
    duration: metadata.duration,
    resolution: metadata.resolution,
    lyrics: metadata.lyrics || "No lyrics found",
    title: path.basename(file.path, path.extname(file.path)),
    album: { name: metadata.album, id: "0", thumb: `${file.id}.jpg` },
    artists: metadata.artists.map((name) => ({ name, thumb: "", id: "" })),
  } satisfies Track<true>;
}
