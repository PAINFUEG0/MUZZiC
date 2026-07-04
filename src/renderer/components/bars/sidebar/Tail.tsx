/** @format */

import { Stats } from "./Stats";
import { useRef, useState } from "react";
import { IoAnalyticsOutline } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { LuArrowBigUpDash, LuSettings2 } from "react-icons/lu";

export function Tail({ setisSettingsOpen }: { setisSettingsOpen: (arg: boolean) => void }) {
  const [direction, setDirection] = useState(1);
  const [view, setView] = useState<"x" | "stats" | null>(null);

  const [atTop, setAtTop] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  const maskImage =
    atTop && atBottom
      ? "none"
      : atTop
        ? "linear-gradient(to bottom, black 85%, transparent 100%)"
        : atBottom
          ? "linear-gradient(to bottom, transparent 0%, black 15%)"
          : "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)";

  return (
    <div className="flex h-fit w-65 shrink-0 scrollbar-none flex-col p-1">
      <div className="flex h-fit w-full flex-col gap-2 rounded-md border-2 border-(--border-color)/20 p-1 py-1.5">
        <AnimatePresence mode="wait">
          <motion.div
            ref={scrollRef}
            style={{ maskImage, WebkitMaskImage: maskImage }}
            animate={{ height: view ? "calc(var(--spacing) * 27)" : "0px" }}
            className="flex w-full shrink-0 scrollbar-none flex-col overflow-y-auto"
            onScroll={() => {
              const el = scrollRef.current;
              el && setAtTop(el.scrollTop <= 0);
              el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
            }}
          >
            <motion.div
              key={view}
              animate={{ x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-full w-full flex-col"
              initial={{ x: direction === 0 ? "0" : direction === 1 ? "70%" : "-70%" }}
            >
              <Stats />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="flex h-fit w-full gap-2 p-1">
          <div className="flex w-full flex-col px-1 text-[10px]">
            <div className="text-[10px] font-medium opacity-100">Resource usage stats</div>
            <div className="text-[9px] font-normal opacity-60">Use buttons to switch view</div>
          </div>

          <div className="flex flex-row items-center gap-1">
            <button
              children={<LuArrowBigUpDash />}
              onClick={() => (setDirection(!view || view === "x" ? 0 : -1), setView(view === "x" ? null : "x"))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-(--border-color)/20 p-1 text-lg active:scale-95"
            />
            <button
              children={<IoAnalyticsOutline />}
              onClick={() => (setDirection(!view || view === "stats" ? 0 : 1), setView(view === "stats" ? null : "stats"))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-(--border-color)/20 p-1 text-lg active:scale-95"
            />
            <button
              onClick={() => setisSettingsOpen(true)}
              children={<LuSettings2 />}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-(--border-color)/20 p-1 text-lg active:scale-95"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
