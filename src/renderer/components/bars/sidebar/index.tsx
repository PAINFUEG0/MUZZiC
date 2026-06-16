/** @format */

import { Head } from "./Head";
import { Body } from "./Body";
import { useState } from "react";
import { useMotionValue, useMotionValueEvent, motion } from "framer-motion";

const MIN_WIDTH = 65 * 4;
const MAX_WIDTH = 65 * 8;

export function Sidebar({ isOpen, isMount }: { isOpen: boolean; isMount: boolean }) {
  const width = useMotionValue(Number(localStorage.getItem("sidebar-width")) || MIN_WIDTH);
  const [animatedWidth, setAnimatedWidth] = useState(width.get());
  const [isDragging, setIsDragging] = useState(false);

  useMotionValueEvent(width, "change", (latest) => setAnimatedWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, latest))));

  return (
    <motion.div
      animate={{ width: isOpen ? animatedWidth : 0 }}
      transition={isMount || isDragging ? { duration: 0 } : {}}
      className="relative flex h-full shrink-0 flex-col overflow-hidden"
    >
      <Head />
      <Body />

      <motion.div
        drag="x"
        onDragStart={() => setIsDragging(true)}
        dragConstraints={{ left: 0, right: 0 }}
        className="absolute top-0 right-0 h-full w-1 cursor-e-resize"
        onDrag={(_, info) => width.set(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width.get() + info.delta.x)))}
        onDragEnd={() => (setIsDragging(false), localStorage.setItem("sidebar-width", width.get().toString()))}
      />
    </motion.div>
  );
}
