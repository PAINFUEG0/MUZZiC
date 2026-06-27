/** @format */

import { BiHeart } from "react-icons/bi";
import { MdDownloading } from "react-icons/md";
import { TbMicrophone2 } from "react-icons/tb";
import { ExpandableItem, Item } from "./Items";
import { PiMusicNoteBold } from "react-icons/pi";
import { themeStore, view } from "../../../utils/globalStores";
import { RiFolderMusicLine, RiPlayListFill } from "react-icons/ri";
import { LuRadio, LuLibrary, LuDisc, LuFolderSearch } from "react-icons/lu";

const mainItems = [
  { icon: <LuFolderSearch />, label: ". . .", toSet: { scene: "explorer" } },
  { icon: <LuRadio />, label: "Radio", toSet: { scene: "radio" } },
  { icon: <MdDownloading />, label: "Downloader", toSet: { scene: "downloads" } },
  { icon: <BiHeart />, label: "Liked Songs", toSet: { scene: "liked" } },
];

const libraryItems = [
  { icon: <LuDisc className="ml-8" />, label: "Tracks", toSet: { scene: "tracks" } },
  { icon: <TbMicrophone2 className="ml-8" />, label: "Artists", toSet: { scene: "artists" } },
  { icon: <RiFolderMusicLine className="ml-8" />, label: "Albums", toSet: { scene: "albums" } },
];

const playlistItems = [
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Hip-hop / Rap", toSet: { scene: "playlist", id: "Playlist 1" } },
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Soul music ( Lithe-like )", toSet: { scene: "playlist", id: "Playlist 2" } },
  { icon: <PiMusicNoteBold className="ml-8" />, label: "Random songs", toSet: { scene: "playlist", id: "Playlist 3" } },
];

const sections = [
  { label: "Library", defaultOpen: true, icon: <LuLibrary />, items: libraryItems },
  { label: "Playlists", defaultOpen: false, icon: <RiPlayListFill />, items: playlistItems },
];

export function Body() {
  const [theme] = themeStore.use();
  const [scene, setScene] = view.use();

  return (
    <div className="relative flex h-full w-65 scrollbar-none flex-col overflow-x-hidden overflow-y-auto p-2 backdrop-blur-md">
      <div className="absolute inset-0 -z-9 h-full w-full bg-white" style={{ opacity: theme.tint.white.bars }} />
      <div className="absolute inset-0 -z-10 h-full w-full bg-black" style={{ opacity: theme.tint.black.bars }} />

      {mainItems.map(({ icon, label, toSet }) => (
        <Item
          key={label}
          icon={icon}
          label={label}
          onClick={() => setScene(toSet)}
          highlighted={JSON.stringify(scene) === JSON.stringify(toSet)}
        />
      ))}

      {sections.map(({ icon, label, items, defaultOpen }) => (
        <ExpandableItem
          key={label}
          icon={icon}
          label={label}
          defaultOpen={defaultOpen}
          collapsable={!items.some(({ toSet }) => JSON.stringify(scene) === JSON.stringify(toSet))}
          items={items.map(({ icon, label, toSet }) => (
            <Item
              key={label}
              icon={icon}
              label={label}
              onClick={() => setScene(toSet)}
              highlighted={JSON.stringify(scene) === JSON.stringify(toSet)}
            />
          ))}
        />
      ))}
    </div>
  );
}
