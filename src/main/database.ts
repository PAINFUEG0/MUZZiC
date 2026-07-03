/** @format */

import { directories } from "./constants";
import { CoreDatabase } from "@xenodb/server";
import { DirNode, Track } from "../shared/types";

export const tree = new CoreDatabase<DirNode>(`${directories.database}/tree`);
export const settings = new CoreDatabase(`${directories.database}/settings`);
export const meta = new CoreDatabase<Track>(`${directories.database}/meta`);
