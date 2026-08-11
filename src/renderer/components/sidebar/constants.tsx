/** @format */

import { MdDownloading } from "react-icons/md";
import { TbMicrophone2 } from "react-icons/tb";
import { RiHeartLine, RiFolderMusicLine } from "react-icons/ri";
import { LuFolderSearch, LuRadio, LuDisc } from "react-icons/lu";

export const mainItems = [
  { icon: <LuFolderSearch />, label: "Explorer", toSet: { scene: "explorer" } },
  { icon: <LuRadio />, label: "Radio", toSet: { scene: "radio" } },
  { icon: <MdDownloading />, label: "Downloader", toSet: { scene: "downloads" } },
  { icon: <RiHeartLine />, label: "Liked Songs", toSet: { scene: "liked" } },
];

export const libraryItems = [
  { icon: <LuDisc className="ml-8" />, label: "Tracks", toSet: { scene: "tracks" } },
  { icon: <TbMicrophone2 className="ml-8" />, label: "Artists", toSet: { scene: "artists" } },
  { icon: <RiFolderMusicLine className="ml-8" />, label: "Albums", toSet: { scene: "albums" } },
];
