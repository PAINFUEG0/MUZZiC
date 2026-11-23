/** @format */

import { settings } from "../database";

export async function setMediaFolder(mediaFolder: string) {
  const _ = settings.get("settings") || {};
  settings.set("settings", { ..._, mediaFolder });
}

export async function getMediaFolder() {
  return settings.get("settings")?.mediaFolder ?? null;
}

export async function setPcmFormat(pcmFormat: "pcm_s16le" | "pcm_s24le" | "pcm_s32le") {
  const _ = settings.get("settings") || {};
  settings.set("settings", { ..._, pcmFormat });
}

export async function getPcmFormat() {
  return settings.get("settings")?.pcmFormat ?? "pcm_s16le";
}

export async function addNode(config: { host: string; secure: boolean; password: string; port: number }) {
  const _ = settings.get("settings") || {};
  settings.set("settings", { ..._, nodes: [...(_.nodes || []), config] });
}

export async function removeNode(index: number) {
  const _ = settings.get("settings") || {};
  settings.set("settings", { ..._, nodes: [...(_.nodes || []).splice(index, 1)] });
}

export async function getNodes() {
  return (settings.get("settings") || {}).nodes || [];
}
