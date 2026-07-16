/** @format */

import { useMask } from "./useMask";
import { ReactNode, RefObject } from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import { useVirtualizer } from "@tanstack/react-virtual";

type Props = {
  list: any[];
  K: (index: number) => number | string;
  scrollRef: RefObject<HTMLDivElement | null>;
  V: ({ index }: { index: number }) => ReactNode;
};

export function useVirtualList({ list, scrollRef, K, V }: Props) {
  const virtualizer = useVirtualizer({
    overscan: 5,
    getItemKey: K,
    count: list.length,
    estimateSize: () => 50,
    getScrollElement: () => scrollRef.current,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  useMask(scrollRef);
  scrollRef.current && (scrollRef.current.style.willChange = "scroll-position");

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
              children={<V index={vItem.index} />}
              style={{ top: 0, left: 0, width: "100%", position: "absolute", transform: `translateY(${vItem.start}px)` }}
            />
          ))
      )}
    </div>
  );

  return [component, virtualizer] as const;
}
