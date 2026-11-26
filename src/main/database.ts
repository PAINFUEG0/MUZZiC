/** @format */

import { directories } from "./constants";
import { CoreDatabase } from "@xenodb/server";
import { DirNode, BaseTrack } from "../shared/types";

export const tree = new CoreDatabase<DirNode>(`${directories.database}/tree`);
export const meta = new CoreDatabase<BaseTrack>(`${directories.database}/meta`);
export const settings = new CoreDatabase<{ mediaFolder?: string; pcmFormat?: "pcm_s16le" | "pcm_s24le" | "pcm_s32le" }>(`${directories.database}/settings`);
