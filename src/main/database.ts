import path from "path";
import { CoreDatabase } from "@xenodb/server";

//  app.getPath("userData")
const databasePath = path.join("./", "database");

export const tree = new CoreDatabase(`${databasePath}/tree`);
export const meta = new CoreDatabase(`${databasePath}/meta`);
export const settings = new CoreDatabase(`${databasePath}/settings`);
