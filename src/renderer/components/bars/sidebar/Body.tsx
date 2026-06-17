/** @format */

import { useState } from "react";
import { BiHeart } from "react-icons/bi";
import { MdDownloading } from "react-icons/md";
import { TbMicrophone2 } from "react-icons/tb";
import { ExpandableItem, Item } from "./Items";
import { PiMusicNoteBold } from "react-icons/pi";
import { LuRadio, LuLibrary, LuDisc } from "react-icons/lu";
import { RiFolderMusicLine, RiPlayListFill } from "react-icons/ri";

const mainItems = [
  { icon: <LuRadio />, label: "Radio", toSet: { type: "radio" } },
  { icon: <BiHeart />, label: "Liked Songs", toSet: { type: "liked" } },
];

const libraryItems = [
  { icon: <LuDisc className="ml-8" />, label: "Tracks", toSet: { type: "tracks" } },
  { icon: <TbMicrophone2 className="ml-8" />, label: "Artists", toSet: { type: "artists" } },
  { icon: <RiFolderMusicLine className="ml-8" />, label: "Albums", toSet: { type: "albums" } },
  { icon: <MdDownloading className="ml-8" />, label: "Downloads", toSet: { type: "downloads" } },
];

const playlistItems = [
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Hip-hop / Rap", toSet: { type: "playlist", id: "Playlist 1" } },
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Soul music ( Lithe-like )", toSet: { type: "playlist", id: "Playlist 2" } },
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Random songs", toSet: { type: "playlist", id: "Playlist 3" } },
];

const sections = [
  { label: "Library", defaultOpen: true, icon: <LuLibrary />, items: libraryItems },
  { label: "Playlists", defaultOpen: false, icon: <RiPlayListFill />, items: playlistItems },
];

export function Body() {
  const [scene, setScene] = useState({ type: "listen now" });
  return (
    <div className="flex h-full w-65 scrollbar-none flex-col overflow-x-hidden overflow-y-auto bg-black/20 p-2 backdrop-blur-md">
      {mainItems.map(({ icon, label, toSet }) => (
        <Item highlighted={JSON.stringify(scene) === JSON.stringify(toSet)} icon={icon} label={label} onClick={() => setScene(toSet)} />
      ))}

      {sections.map(({ icon, label, items, defaultOpen }) => (
        <ExpandableItem
          key={label}
          icon={icon}
          label={label}
          defaultOpen={defaultOpen}
          collapsable={!items.some(({ toSet }) => JSON.stringify(scene) === JSON.stringify(toSet))}
          items={items.map(({ icon, label, toSet }) => (
            <Item highlighted={JSON.stringify(scene) === JSON.stringify(toSet)} icon={icon} label={label} onClick={() => setScene(toSet)} />
          ))}
        />
      ))}
    </div>
  );
}
