/** @format */

import { bin } from "../constants";
import { spawn } from "node:child_process";

export async function ffprobe(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const streamFields = [
      "codec_name",
      "codec_long_name",

      "sample_rate",
      "sample_fmt",

      "bit_rate",
      "bits_per_sample",
      "bits_per_raw_sample",

      "channels",
      "channel_layout",
    ];
    const args = [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-select_streams",
      "a:0",
      "-show_entries",
      `format=duration:format_tags:stream=${streamFields.join(",")}`,
      path,
    ];

    let stdout = "";
    let stderr = "";
    const child = spawn(bin.ffprobe.path, args, { stdio: ["ignore", "pipe", "pipe"] });

    child.on("error", reject);
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("close", (code) => (code !== 0 ? reject(new Error(`ffprobe exited with code ${code}\n${stderr}`)) : resolve(stdout)));
  });
}
