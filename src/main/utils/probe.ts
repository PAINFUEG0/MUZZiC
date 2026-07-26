/** @format */

import path from "node:path";
import { bin } from "../constants";
import { File } from "../../shared/types";
import { BaseTrack } from "../../shared/types";
import { spawn } from "node:child_process";

const regex = /,|;| feat\.?| ft\.?| & /i;

export async function probe(file: File) {
  const data = JSON.parse(await ffprobe(file.path).catch(() => "{}"));

  const stream = data?.streams?.[0];
  const tags = data?.format?.tags || {};
  const sampleRate = Number(stream?.sample_rate || 0);
  const streamBitrate = Number(stream?.bit_rate || 0);
  const codec = (stream?.codec_name || "").toLowerCase();
  const bitDepth = Number(stream?.bits_per_raw_sample || stream?.bits_per_sample || 0);

  let resolution: BaseTrack["resolution"]["name"] = "CD";
  if (codec === "ac3" || codec === "eac3") resolution = "DD";
  else if (codec === "mp3" || codec === "aac" || codec === "opus" || codec === "vorbis") resolution = "SR";
  else if (bitDepth > 16 || sampleRate > 44100) resolution = "HR";

  return {
    id: file.id,
    thumb: `${file.id}.jpg`,
    needsTranscoding: false,
    duration: Number(data?.format?.duration),
    title: path.basename(file.path, path.extname(file.path)),
    album: (tags.album || tags.ALBUM || "Unknown") as string,
    artists: (tags.artist || tags.ARTIST || "Unknown")
      .split(regex)
      .map((v: any) => v.trim?.())
      .filter(Boolean) as string[],
    resolution: { name: resolution, bitDepth: bitDepth, sampleRate: sampleRate, bitrate: streamBitrate },
    lyrics: tags["LYRICS"] || tags["lyrics"] || tags["UNSYNCEDLYRICS"] || tags["lyrics-eng"] || "No lyrics found",
    explicit: ["1", "true", "yes", "explicit"].includes(String(tags.explicit || tags.ITUNESADVISORY || tags.EXPLICIT).toLowerCase()),
  } satisfies BaseTrack;
}

function ffprobe(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_entries",
      "format=duration:format_tags:stream=bit_rate,codec_name,sample_rate,bits_per_sample,bits_per_raw_sample,channels,channel_layout",
      path,
    ];

    let stdout = "";
    let stderr = "";
    const child = spawn(bin.ffprobe.path, args, { stdio: ["ignore", "pipe", "pipe"] });

    child.on("error", reject);
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("close", (code) => (code !== 0 ? reject(new Error(`ffprobe exited with code ${code}\n${stderr}`)) : resolve(stdout)));
  });
}
