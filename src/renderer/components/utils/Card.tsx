/** @format */

import { memo } from "react";

export const Card = memo(({ thumb, label1, label2, onClick }: { thumb: string; label1: string; label2: string; onClick: () => void }) => (
  <div onClick={onClick} className="relative flex aspect-square h-full w-full cursor-pointer flex-col overflow-hidden rounded-md border-2 border-(--border-color)/20 active:scale-99">
    <img src={thumb} loading="lazy" decoding="async" draggable={false} onError={(e) => (e.currentTarget.src = "./logo.png")} className="absolute inset-0 -z-10 h-full w-full object-cover" />

    <div className="flex h-full w-full flex-col items-end justify-end">
      <div className="flex h-12 w-full flex-col items-center gap-0.5 bg-(--hover-color)/50 p-2 backdrop-blur-sm">
        <div className="w-full min-w-0 flex-row truncate text-center text-[11px] font-bold" children={label1} />
        <div className="w-full min-w-0 flex-row truncate text-center text-[10px] opacity-50" children={label2} />
      </div>
    </div>
  </div>
));
