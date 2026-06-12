import { settings } from "../database";

export async function setMediaFolder(dir: string) {
  settings.set("mediaFolder", dir);
}

export async function getMediaFolder() {
  return settings.get("mediaFolder") as string | null;
}
