import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

type Resolution = "SR" | "CD" | "HR" | "DD";
export type T = { duration: number; artists: string[]; explicit: boolean; album: string; resolution: Resolution };

export async function extractAudioMetadata(file: string): Promise<T> {
  const data = JSON.parse(
    (await execFileAsync("ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", file])).stdout,
  );

  const tags = data.format.tags || {};
  const stream = data.streams.find((s: any) => s.codec_type === "audio");

  const sampleRate = Number(stream?.sample_rate || 0);
  const codec = (stream?.codec_name || "").toLowerCase();
  const bitDepth = Number(stream?.bits_per_sample || stream?.bits_per_raw_sample || 0);

  const resolution = ["ac3", "eac3"].includes(codec)
    ? "DD"
    : ["mp3", "aac", "opus", "vorbis"].includes(codec)
      ? "SR"
      : bitDepth > 16 || sampleRate > 44100
        ? "HR"
        : "CD";

  return {
    resolution,
    duration: Number(data.format.duration),
    album: tags.album || tags.ALBUM || "Unknown",
    artists: (tags.artist || tags.ARTIST || "Unknown")
      .split(/,|;| feat\.?| ft\.?| & /i)
      .map((v: any) => `${v}`.trim())
      .filter(Boolean),
    explicit: ["1", "true", "yes", "explicit"].includes(String(tags.explicit || tags.ITUNESADVISORY || tags.EXPLICIT).toLowerCase()),
  };
}
