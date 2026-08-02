/** @format */

import { BaseTrack } from "../../shared/types";
import { DSD, LOSSY, SURROUND, LOSSLESS } from "../constants";

export function classifyResolution(codec: string, bitDepth: number): BaseTrack["resolution"]["name"] {
  const c = codec.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (DSD.has(c)) return "HR";
  if (LOSSY.has(c)) return "SR";
  if (SURROUND.has(c)) return "DD";
  if (LOSSLESS.has(c)) return bitDepth > 16 ? "HR" : "CD";
  return "SR";
}
