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

      {[{ label: "Library", defaultOpen: true, icon: <LuLibrary />, items: libraryItems }].map(({ icon, label, items, defaultOpen }) => (
        <ExpandableItem
          key={label}
          icon={icon}
          label={label}
          defaultOpen={defaultOpen}
          collapsable={!items.some(({ toSet }) => JSON.stringify(scene) === JSON.stringify(toSet))}
          items={items.map(({ icon, label, toSet }) => (
            <Item key={label} icon={icon} label={label} onClick={() => setScene(toSet)} highlighted={JSON.stringify(scene) === JSON.stringify(toSet)} />
          ))}
        />
      ))}

      {[
        {
          label: "Playlists",
          defaultOpen: false,
          icon: <RiPlayListFill />,
          items: playlists.map(({ name, K }) => ({ icon: <PiMusicNoteBold className="ml-8" />, label: name, toSet: { scene: "playlist", K } })),
        },
      ].map(({ icon, label, items, defaultOpen }) => (
        <ExpandableItem
          key={label}
          icon={icon}
          label={label}
          defaultOpen={defaultOpen}
          collapsable={!items.some(({ toSet }) => JSON.stringify(scene) === JSON.stringify(toSet))}
          items={items.map(({ icon, label, toSet }) => (
            <Item key={label} icon={icon} label={label} onClick={() => setScene(toSet)} highlighted={JSON.stringify(scene) === JSON.stringify(toSet)} />
          ))}
        />
      ))}
    </div>
  );
}
