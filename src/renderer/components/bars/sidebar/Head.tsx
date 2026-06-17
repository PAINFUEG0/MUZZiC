/** @format */

import { RiMusic2Fill } from "react-icons/ri";

export function Head() {
  return (
    <div className="relative flex h-20 w-65 shrink-0 flex-row items-center justify-center gap-1 bg-(--theme)">
      <RiMusic2Fill className="text-lg" />
      <span className="font-medium">MUZZiC</span>
    </div>
  );
}
