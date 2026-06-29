/** @format */

import fs from "node:fs";
import axios from "axios";
import ffbinaries from "ffbinaries";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { DLP, FFMPEG, FFPROBE, WIN32, YT_DLP_BIN_URL as URL, directories } from "../constants";

const execute = promisify(exec);

export const checkDLP = async () => fs.existsSync(DLP);

export const checkFFMPEG = async () => fs.existsSync(FFMPEG);

export const checkFFPROBE = async () => fs.existsSync(FFPROBE);

export const patch = async (bin: string) => void (!WIN32 && (await execute(`chmod +x ${bin}`)));

export const downloadFFMPEG = () =>
  promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffmpeg"], { destination: directories.bin }))().then(() => patch(FFMPEG));

export const downloadFFPROBE = () =>
  promisify(ffbinaries.downloadBinaries.bind(ffbinaries, ["ffprobe"], { destination: directories.bin }))().then(() => patch(FFPROBE));

export const downloadDLP = () =>
  axios(URL, { responseType: "arraybuffer" }).then(({ data }) => fs.promises.writeFile(DLP, Buffer.from(data)).then(() => patch(DLP)));
