/** @format */

import { Item } from "./Item";
import { useRef } from "react";
import { sceneStore } from "../../stores";
import { ExpandableItem } from "./ExpandableItem";
import { mainItems, sections } from "./constants";
import { useBlurMask } from "../../hooks/useBlurMask";

export function Body() {
  const [scene, setScene] = sceneStore.use();
  const ref = useRef<HTMLDivElement>(null);

  useBlurMask(ref);
  return (
    <div ref={ref} className="relative flex h-full w-67 scrollbar-none flex-col overflow-x-hidden overflow-y-auto p-2">
      {mainItems.map(({ icon, label, toSet }) => (
        <Item key={label} icon={icon} label={label} onClick={() => setScene(toSet)} highlighted={JSON.stringify(scene) === JSON.stringify(toSet)} />
      ))}

      {sections.map(({ icon, label, items, defaultOpen }) => (
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
