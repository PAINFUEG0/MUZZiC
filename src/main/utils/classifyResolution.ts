/** @format */

import { BaseTrack } from "../../shared/types";
import { DSD, LOSSY, SURROUND, LOSSLESS } from "../constants";

export function classifyResolution(codec: string, bitDepth: number, sampleRate: number): BaseTrack["resolution"]["name"] {
  const c = codec.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (DSD.has(c)) return "HR";
  if (LOSSY.has(c)) return "SR";
  if (SURROUND.has(c)) return "DD";
  if (LOSSLESS.has(c) || bitDepth > 0) return "CD";
  if (bitDepth > 16 || sampleRate > 44100) return "HR";

  return "SR";
}
