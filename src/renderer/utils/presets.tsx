/** @format */

import { GiGClef } from "react-icons/gi";
import { TbVinyl } from "react-icons/tb";
import { VscPiano } from "react-icons/vsc";
import { FaGuitar } from "react-icons/fa6";
import { IoHeadsetSharp } from "react-icons/io5";
import { BsCassetteFill, BsMusicPlayerFill } from "react-icons/bs";
import { PiMicrophoneStageBold, PiMusicNoteFill, PiWaveformBold, PiWrench } from "react-icons/pi";

export const presets = [
  {
    name: "Custom",
    get EQ() {
      const _ = localStorage.getItem("CEQ");
      if (_) return JSON.parse(_) as number[];
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    },
    icon: <PiWrench className="text-sm" />,
  },
  { name: "Bass Boost", EQ: [0, +5, +5, +5, +3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], icon: <PiWaveformBold className="text-sm" /> },
  { name: "Classical", EQ: [0, +4, +3, +2, +1, 0, -1, -1, 0, 0, 0, +2, 0, +4, +4], icon: <VscPiano className="text-sm" /> },
  { name: "Electronic", EQ: [0, +5, +5, +2, 0, 0, -1, +1, 0, 0, 0, +2, 0, +5, +5], icon: <IoHeadsetSharp className="text-sm" /> },
  { name: "Flat", EQ: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], icon: <PiMusicNoteFill className="text-sm" /> },
  { name: "Hip Hop", EQ: [0, +5, +5, +4, +1, 0, -1, -1, 0, +1, 0, +1, 0, +3, +4], icon: <BsCassetteFill className="text-sm" /> },
  { name: "Jazz", EQ: [0, +3, +2, +1, +2, 0, -1, -1, 0, 0, 0, +2, 0, +3, +4], icon: <FaGuitar className="text-sm" /> },
  { name: "Pop", EQ: [0, -1, +2, +4, +5, 0, +5, +4, 0, +2, 0, +1, 0, +2, +2], icon: <TbVinyl className="text-sm" /> },
  { name: "Rock", EQ: [0, +5, +4, +3, +1, 0, -1, -1, 0, +1, 0, +3, 0, +4, +5], icon: <BsMusicPlayerFill className="text-sm" /> },
  { name: "Treble Boost", EQ: [0, 0, 0, 0, 0, 0, 0, +1, 0, +3, 0, +5, 0, +5, +5], icon: <GiGClef className="text-sm" /> },
  { name: "Vocal", EQ: [0, -3, -2, -1, +2, 0, +5, +5, 0, +5, 0, +3, 0, +1, 0], icon: <PiMicrophoneStageBold className="text-sm" /> },
];
