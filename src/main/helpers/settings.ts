/** @format */

import { settings } from "../database";

export async function setMediaFolder(dir: string) {
  settings.set("mediaFolder", dir);
}

export async function getMediaFolder() {
  return settings.get("mediaFolder") as string | null;
}

export async function setPcmFormat(format: "pcm_s16le" | "pcm_s24le" | "pcm_s32le") {
  settings.set("pcmFormat", format);
}

export async function getPcmFormat() {
  return (settings.get("pcmFormat") as "pcm_s16le" | "pcm_s24le" | "pcm_s32le" | null) ?? "pcm_s16le";
}
