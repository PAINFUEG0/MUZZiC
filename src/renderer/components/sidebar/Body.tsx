/** @format */

import { Item } from "./Item";
import { useRef } from "react";
import { view } from "../../utils/stores";
import { useMask } from "../../hooks/useMask";
import { ExpandableItem } from "./ExpandableItem";
import { mainItems, sections } from "./constants";

export function Body() {
  const [scene, setScene] = view.use();
  const ref = useRef<HTMLDivElement>(null);

  useMask(ref);
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
