import * as path from "path";
import { promisify } from "util";
import { execFile } from "child_process";

const execFileAsync = promisify(execFile);

export async function extractCover(input: string, id: string) {
  const thumb = path.resolve(path.resolve(process.cwd(), "./database") || path.dirname(input), `.${id}.jpg`);
  await execFileAsync("ffmpeg", ["-i", input, "-an", "-vf", `scale=${750}:-1`, "-frames:v", "1", "-q:v", "2", "-y", thumb]);
  return thumb;
}
