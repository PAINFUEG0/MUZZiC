import * as path from "path";
import { spawn } from "child_process";

export async function buildThumbs(input: string, id: string) {
  const thumb = path.resolve(process.cwd() || path.dirname(input), `.${id}.jpg`);
  await extractCover(input, thumb, 750);
  return thumb;
}

async function extractCover(input: string, output: string, size: number) {
  return new Promise<void>((resolve, reject) =>
    spawn("ffmpeg", ["-i", input, "-an", "-vf", `scale=${size}:-1`, "-frames:v", "1", "-q:v", "2", "-y", output])
      .on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))))
      .on("error", reject),
  );
}
