import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

export async function thumb(source: string, dest: string) {
  return execFileAsync(process.env.FFMPEG!, ["-i", source, "-an", "-vf", `scale=${750}:-1`, "-frames:v", "1", "-q:v", "2", "-y", dest]);
}
