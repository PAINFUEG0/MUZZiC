import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { Track } from "../../../shared/types/sourcePlugin.js";

const execFileAsync = promisify(execFile);

const regex = /,|;| feat\.?| ft\.?| & /i;

export async function probe(path: string) {
  const data = JSON.parse(
    (
      await execFileAsync("./bin/ffprobe.exe", [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_entries",
        "format=duration:format_tags:stream=codec_name,sample_rate,bits_per_sample,bits_per_raw_sample",
        path,
      ]).catch(() => ({ stdout: "{}" }))
    ).stdout,
  );

  const tags = data?.format?.tags || {};
  const stream = data?.streams?.find((s: any) => s.codec_type === "audio");

  const sampleRate = Number(stream?.sample_rate || 0);
  const codec = (stream?.codec_name || "").toLowerCase();
  const bitDepth = Number(stream?.bits_per_sample || stream?.bits_per_raw_sample || 0);

  let resolution: Track["resolution"] = "CD";

  if (codec === "ac3" || codec === "eac3") resolution = "DD";
  else if (codec === "mp3" || codec === "aac" || codec === "opus" || codec === "vorbis") resolution = "SR";
  else if (bitDepth > 16 || sampleRate > 44100) resolution = "HR";

  return {
    resolution,
    duration: Number(data?.format?.duration),
    album: (tags.album || tags.ALBUM || "Unknown") as string,
    artists: (tags.artist || tags.ARTIST || "Unknown")
      .split(regex)
      .map((v: any) => v.trim?.())
      .filter(Boolean) as string[],
    lyrics: (tags["LYRICS"] || tags["lyrics"] || tags["UNSYNCEDLYRICS"] || tags["lyrics-eng"] || null) as string | null,
    explicit: ["1", "true", "yes", "explicit"].includes(String(tags.explicit || tags.ITUNESADVISORY || tags.EXPLICIT).toLowerCase()),
  };
}
