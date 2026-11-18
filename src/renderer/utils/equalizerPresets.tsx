/** @format */

import {
  PiWrench,
  PiWaveformBold,
  PiMusicNoteFill,
  PiMicrophoneStageBold,
  PiMicrophoneBold,
  PiMoonBold,
  PiSpeakerHighBold,
  PiFireBold,
  PiFilmSlateBold,
  PiGameControllerBold,
  PiRadioBold,
  PiSmileyBold,
  PiLightningBold,
  PiHeadphonesBold,
} from "react-icons/pi";
import { TbVinyl } from "react-icons/tb";
import { GiGClef } from "react-icons/gi";
import { FaGuitar } from "react-icons/fa";
import { VscPiano } from "react-icons/vsc";
import { IoHeadsetSharp } from "react-icons/io5";
import { BsCassetteFill, BsMusicPlayerFill } from "react-icons/bs";

const LIMIT = 5;
export const BANDS = 15;

const clamp = (n: number) => Math.max(-LIMIT, Math.min(LIMIT, n));

const smooth = (pts: number[], bands = BANDS): number[] =>
  Array.from({ length: bands }, (_, i) => {
    const t = (i / (bands - 1)) * (pts.length - 1);
    const i1 = Math.min(Math.floor(t), pts.length - 2);
    const f = t - i1;
    const p0 = pts[Math.max(i1 - 1, 0)]!;
    const p1 = pts[i1]!;
    const p2 = pts[i1 + 1]!;
    const p3 = pts[Math.min(i1 + 2, pts.length - 1)]!;
    const v = 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
    return Math.round(clamp(v) * 10) / 10;
  });

export const presets = [
  {
    name: "Custom",
    get EQ() {
      const _ = localStorage.getItem("CEQ");
      return _ ? (JSON.parse(_) as number[]) : new Array(BANDS).fill(0);
    },
    icon: <PiWrench className="text-sm" />,
  },

  { name: "Acoustic", EQ: smooth([3, 3, 2, 1, 1, 2, 3, 2]), icon: <PiHeadphonesBold className="text-sm" /> },
  { name: "Bass Boost", EQ: smooth([5, 5, 4, 2, 0, 0, 0, 0]), icon: <PiWaveformBold className="text-sm" /> },
  { name: "Bass Reducer", EQ: smooth([-5, -4, -2, 0, 0, 0, 0, 0]), icon: <PiLightningBold className="text-sm" /> },
  { name: "Classical", EQ: smooth([3, 2, 1, 0, -1, 0, 2, 3]), icon: <VscPiano className="text-sm" /> },
  { name: "Electronic", EQ: smooth([5, 4, 1, -1, 1, 2, 4, 5]), icon: <IoHeadsetSharp className="text-sm" /> },
  { name: "Flat", EQ: new Array(BANDS).fill(0), icon: <PiMusicNoteFill className="text-sm" /> },
  { name: "Gaming", EQ: smooth([2, 0, -1, 0, 2, 4, 3, 1]), icon: <PiGameControllerBold className="text-sm" /> },
  { name: "Hip Hop", EQ: smooth([5, 4, 2, 0, -1, 1, 2, 3]), icon: <BsCassetteFill className="text-sm" /> },
  { name: "Jazz", EQ: smooth([3, 2, 1, 2, 0, -1, 1, 3]), icon: <FaGuitar className="text-sm" /> },
  { name: "Late Night", EQ: smooth([-3, -2, 0, 2, 3, 2, 0, -1]), icon: <PiMoonBold className="text-sm" /> },
  { name: "Lo-Fi", EQ: smooth([1, 2, 2, 1, 0, -2, -4, -5]), icon: <PiRadioBold className="text-sm" /> },
  { name: "Loudness", EQ: smooth([5, 3, 0, -1, -1, 0, 3, 5]), icon: <PiSpeakerHighBold className="text-sm" /> },
  { name: "Metal", EQ: smooth([4, 3, 0, -2, 0, 3, 4, 3]), icon: <PiFireBold className="text-sm" /> },
  { name: "Movie", EQ: smooth([4, 3, 1, 0, 1, 2, 3, 3]), icon: <PiFilmSlateBold className="text-sm" /> },
  { name: "Podcast", EQ: smooth([-5, -3, 0, 3, 4, 3, 1, -2]), icon: <PiMicrophoneBold className="text-sm" /> },
  { name: "Pop", EQ: smooth([-1, 1, 3, 4, 2, 1, 2, 2]), icon: <TbVinyl className="text-sm" /> },
  { name: "R&B", EQ: smooth([4, 5, 3, 1, -1, 0, 1, 2]), icon: <PiSmileyBold className="text-sm" /> },
  { name: "Rock", EQ: smooth([4, 3, 1, -1, 0, 2, 4, 4]), icon: <BsMusicPlayerFill className="text-sm" /> },
  { name: "Treble Boost", EQ: smooth([0, 0, 0, 0, 1, 3, 5, 5]), icon: <GiGClef className="text-sm" /> },
  { name: "Vocal", EQ: smooth([-3, -2, 0, 3, 5, 4, 2, 0]), icon: <PiMicrophoneStageBold className="text-sm" /> },
];
