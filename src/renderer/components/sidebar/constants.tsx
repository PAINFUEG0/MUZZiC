/** @format */

import { MdDownloading } from "react-icons/md";
import { TbMicrophone2 } from "react-icons/tb";
import { PiMusicNoteBold } from "react-icons/pi";
import { LuFolderSearch, LuRadio, LuDisc, LuLibrary } from "react-icons/lu";
import { RiHeartLine, RiFolderMusicLine, RiPlayListFill } from "react-icons/ri";

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

export const playlistItems = [
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Hip-hop / Rap", toSet: { scene: "playlist", id: "Playlist 1" } },
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Soul music ( Lithe-like )", toSet: { scene: "playlist", id: "Playlist 2" } },
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Random songs", toSet: { scene: "playlist", id: "Playlist 3" } },
];

export const sections = [
  { label: "Library", defaultOpen: true, icon: <LuLibrary />, items: libraryItems },
  { label: "Playlists", defaultOpen: false, icon: <RiPlayListFill />, items: playlistItems },
];
