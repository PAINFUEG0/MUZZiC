/** @format */

import { useBlurMask } from "./useBlurMask";
import { RiErrorWarningLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ComponentType, ReactNode, RefObject, useEffect } from "react";

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
    overscan: overscan || 15,
    estimateSize: estimateSize || (() => 50),
    getScrollElement: () => scrollRef.current,
  });

  useBlurMask(scrollRef, list.length > 0);
  useEffect(() => void (scrollRef.current && (scrollRef.current.style.willChange = "scroll-position")), [scrollRef]);

  const component = (
    <div style={{ height: list.length ? virtualizer.getTotalSize() : "100%", position: "relative" }}>
      {virtualizer.getVirtualItems().length === 0 ? (
        emptyComponent || (
          <div className="flex h-full w-full flex-row items-center justify-center gap-2 rounded-md border-2 border-(--border-color)/20 py-5 text-xl font-medium">
            <RiErrorWarningLine className="mt-0.5" />
            <div>No items to display</div>
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {virtualizer.getVirtualItems().map((vItem) => (
            <motion.div
              key={vItem.key}
              data-index={vItem.index}
              ref={virtualizer.measureElement}
              initial={{ opacity: 1, y: vItem.start }}
              animate={{ opacity: 1, y: vItem.start }}
              children={<Component index={vItem.index} />}
              style={{ top: 0, left: 0, width: "100%", position: "absolute" }}
              exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );

  return [component, virtualizer] as const;
}
