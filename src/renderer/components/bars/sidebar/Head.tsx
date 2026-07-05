/** @format */

import { RiMusic2Fill } from "react-icons/ri";

export function Head() {
  return (
    <div className="relative flex h-15 w-65 shrink-0 flex-row items-center justify-center gap-1 text-(--accent-color)">
      <div className="absolute -z-1 h-full w-full bg-(--accent-color)/10" />

      <RiMusic2Fill className="text-lg" />
      <span className="font-medium">MUZZiC</span>
    </div>
  );
}
