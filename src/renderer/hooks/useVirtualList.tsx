/** @format */

import { useMask } from "./useMask";
import { ComponentType, ReactNode, RefObject, useEffect } from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import { useVirtualizer } from "@tanstack/react-virtual";

type Props = {
  list: any[];
  overscan?: number;
  emptyComponent?: ReactNode;
  estimateSize?: (index: number) => number;
  scrollRef: RefObject<HTMLDivElement | null>;
  Component: ComponentType<{ index: number }>;
  getItemKey: (index: number) => number | string;
};

export function useVirtualList({ list, scrollRef, getItemKey, Component, overscan, estimateSize, emptyComponent }: Props) {
  const virtualizer = useVirtualizer({
    getItemKey,
    count: list.length,
    overscan: overscan || 5,
    estimateSize: estimateSize || (() => 50),
    getScrollElement: () => scrollRef.current,
  });

  useMask(scrollRef, list.length > 0);
  useEffect(() => void (scrollRef.current && (scrollRef.current.style.willChange = "scroll-position")), [scrollRef]);

  console.log(list.length > 0);

  const component = (
    <div style={{ height: list.length ? virtualizer.getTotalSize() : "100%", position: "relative" }}>
      {virtualizer.getVirtualItems().length === 0
        ? emptyComponent || (
            <div className="flex h-full w-full flex-row items-center justify-center gap-2 rounded-md border-2 border-(--border-color)/20 py-5 text-xl font-medium">
              <RiErrorWarningLine className="mt-0.5" />
              <div>No items to display</div>
            </div>
          )
        : virtualizer
            .getVirtualItems()
            .map((vItem) => (
              <div
                key={vItem.key}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                children={<Component index={vItem.index} />}
                style={{ top: 0, left: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px)` }}
              />
            ))}
    </div>
  );

  return [component, virtualizer] as const;
}
