/** @format */

import path from "node:path";
import { CoreDatabase } from "@xenodb/server";
import { DirNode } from "../shared/types";
import { Track } from "../shared/types";

//  app.getPath("userData")
const databasePath = path.join("./", "database");

export const tree = new CoreDatabase<DirNode>(`${databasePath}/tree`);
export const settings = new CoreDatabase(`${databasePath}/settings`);
export const meta = new CoreDatabase<Track>(`${databasePath}/meta`);
