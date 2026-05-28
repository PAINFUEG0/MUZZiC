import path from "path";
import { CoreDatabase } from "@xenodb/server";

//  app.getPath("userData")
const databasePath = path.join("./", "database");

export const settings = new CoreDatabase(`${databasePath}/settings`);
