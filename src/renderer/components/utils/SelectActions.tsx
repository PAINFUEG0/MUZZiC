/** @format */

import { selected, selectMode } from "../../stores";

export function SelectActions() {
  const [selections, setSelctions] = selected.use();
  const [inSelectionMode, setInSelectionMode] = selectMode.use();
  return (
    <div className="flex flex-row">
      {inSelectionMode && (
        <div
          style={{ opacity: selections.length ? 1 : 0.5 }}
          className="mx-1 flex h-fit w-fit cursor-pointer items-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
        >
          <div>Add to playlist</div>
          <div className="text-center text-[10px]" children="(" />
          <div className="mt-px text-center text-[10px]" children={selections.length} />
          <div className="text-center text-[10px]" children=")" />
        </div>
      )}
      {inSelectionMode && (
        <div
          children="Cancel"
          onClick={() => (setInSelectionMode(false), setSelctions([]))}
          className="mx-1 flex h-fit w-fit cursor-pointer items-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--accent-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-94"
        />
      )}
    </div>
  );
}
