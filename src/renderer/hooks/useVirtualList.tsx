/** @format */

import { useMask } from "./useMask";
import { RefObject, useEffect } from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import { useVirtualizer } from "@tanstack/react-virtual";

type Props = {
  list: any[];
  overscan?: number;
  estimateSize?: (index: number) => number;
  scrollRef: RefObject<HTMLDivElement | null>;
  getItemKey: (index: number) => number | string;
  Component: React.ComponentType<{ index: number }>;
};

export function useVirtualList({ list, scrollRef, getItemKey, Component, overscan, estimateSize }: Props) {
  const virtualizer = useVirtualizer({
    getItemKey,
    count: list.length,
    overscan: overscan || 5,
    estimateSize: estimateSize || (() => 50),
    getScrollElement: () => scrollRef.current,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  useMask(scrollRef);
  useEffect(() => void (scrollRef.current && (scrollRef.current.style.willChange = "scroll-position")), [scrollRef]);

  const component = (
    <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
      {virtualizer.getVirtualItems().length === 0 ? (
        <div className="flex h-fit w-full flex-row items-center justify-center gap-2 rounded-md border-2 border-(--border-color)/20 py-5 text-xl font-medium">
          <RiErrorWarningLine className="mt-0.5" />
          <div>No items to display</div>
        </div>
      ) : (
        virtualizer
          .getVirtualItems()
          .map((vItem) => (
            <div
              key={vItem.key}
              data-index={vItem.index}
              ref={virtualizer.measureElement}
              children={<Component index={vItem.index} />}
              style={{ top: 0, left: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px)` }}
            />
          ))
      )}
    </div>
  );

  return [component, virtualizer] as const;
}
