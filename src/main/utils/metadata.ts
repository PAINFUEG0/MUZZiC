/** @format */

import path from "node:path";
import { ffprobe } from "./probe";
import { File } from "../../shared/types";
import { BaseTrack } from "../../shared/types";
import { classifyResolution } from "./classifyResolution";

const regex = /,|;| feat\.?| ft\.?| & /i;

export async function metadata(file: File): Promise<BaseTrack> {
  const data = JSON.parse(await ffprobe(file.path).catch(() => "{}"));

  const id = file.id;
  const thumb = `${file.id}.jpg`;
  const title = path.basename(file.path, path.extname(file.path));

  const stream = data?.streams?.[0];
  const tags = data?.format?.tags || {};
  const duration = data?.format?.duration || 0;

  const channels = stream?.channels || 0;
  const layout = stream?.channel_layout || "";

  const codec = (stream?.codec_name || "").toLowerCase();

  const bitrate = stream?.bit_rate || 0;
  const sampleRate = stream?.sample_rate || 0;
  const sampleFormat = stream?.sample_fmt || "";
  const bitDepth = stream?.bits_per_raw_sample || stream?.bits_per_sample || 0;
  const resolution = { name: classifyResolution(codec, bitDepth), bitDepth, sampleRate, bitrate, sampleFormat };

  const album = (tags.album || tags.ALBUM || "Unknown") as string;
  const artists = (tags.artist || tags.ARTIST || "Unknown").split(regex).filter((_: any) => Boolean(_?.trim?.()));

  const lyrics = tags["LYRICS"] || tags["lyrics"] || tags["UNSYNCEDLYRICS"] || tags["lyrics-eng"] || "No lyrics found";
  const explicit = ["1", "true", "yes", "explicit"].includes(String(tags.explicit || tags.ITUNESADVISORY || tags.EXPLICIT).toLowerCase());

  return { codec, layout, channels, id, thumb, duration, title, album, artists, resolution, lyrics, explicit };
}
