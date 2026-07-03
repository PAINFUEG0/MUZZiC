/** @format */

import { access, constants } from "node:fs/promises";

export async function existsBin(bin: string) {
  try {
    await access(bin, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
