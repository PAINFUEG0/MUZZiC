/** @format */

import fs from "node:fs";
import axios from "axios";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { existsBin } from "../utils/existsBin";
import { DLP, FFMPEG, FFPROBE, WIN32, YT_DLP_BIN_URL as URL, directories } from "../constants";
import { downloadBin } from "../utils/downloadBin.js";

const execute = promisify(exec);

export const checkDLP = async () => existsBin(DLP);

export const checkFFMPEG = async () => existsBin(FFMPEG);

export const checkFFPROBE = async () => existsBin(FFPROBE);

export const patch = async (bin: string) => void (!WIN32 && (await execute(`chmod +x ${bin}`)));

export const downloadFFMPEG = () => downloadBin("ffmpeg", directories.bin).then(() => patch(FFMPEG));

export const downloadFFPROBE = () => downloadBin("ffprobe", directories.bin).then(() => patch(FFPROBE));

export const downloadDLP = () =>
  axios(URL, { responseType: "arraybuffer" }).then(({ data }) => fs.promises.writeFile(DLP, Buffer.from(data)).then(() => patch(DLP)));
