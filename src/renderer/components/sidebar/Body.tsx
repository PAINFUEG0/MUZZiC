/** @format */

import { Item } from "./Item";
import { useRef } from "react";
import { LuLibrary } from "react-icons/lu";
import { RiPlayListFill } from "react-icons/ri";
import { PiMusicNoteBold } from "react-icons/pi";
import { ExpandableItem } from "./ExpandableItem";
import { useBlurMask } from "../../hooks/useBlurMask";
import { libraryItems, mainItems } from "./constants";
import { playlistStore, sceneStore } from "../../stores";

export function Body() {
  const [playlists] = playlistStore.use();
  const ref = useRef<HTMLDivElement>(null);
  const [scene, setScene] = sceneStore.use();

  useBlurMask(ref);

  return (
    <div ref={ref} className="relative flex h-full w-67 scrollbar-none flex-col overflow-x-hidden overflow-y-auto p-2">
      {mainItems.map(({ icon, label, toSet }) => (
        <Item key={label} icon={icon} label={label} onClick={() => setScene(toSet)} highlighted={JSON.stringify(scene) === JSON.stringify(toSet)} />
      ))}

      <ExpandableItem
        defaultOpen
        key="Library"
        label="Library"
        icon={<LuLibrary />}
        collapsable={!libraryItems.some(({ toSet }) => JSON.stringify(scene) === JSON.stringify(toSet))}
        items={libraryItems.map(({ icon, label, toSet }) => (
          <Item key={label} icon={icon} label={label} onClick={() => setScene(toSet)} highlighted={JSON.stringify(scene) === JSON.stringify(toSet)} />
        ))}
      />

      <ExpandableItem
        key="Playlists"
        label="Playlists"
        icon={<RiPlayListFill />}
        collapsable={scene.scene !== "playlist"}
        items={playlists.map(({ name, K }) => (
          <Item label={name} highlighted={scene.K === K} icon={<PiMusicNoteBold className="ml-8" />} onClick={() => setScene({ scene: "playlist", K })} />
        ))}
      />
    </div>
  );
}
