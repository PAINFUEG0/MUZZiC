/** @format */

import { Noti } from "./noti";
import { Stats } from "./Stats";
import { LuInfo } from "react-icons/lu";
import pkg from "../../../../package.json";
import { BsGearWide } from "react-icons/bs";
import { RiDonutChartFill } from "react-icons/ri";
import { notificationsStore } from "../../stores";
import { useRef, useState } from "react";
import { useBlurMask } from "../../hooks/useBlurMask";
import { AnimatePresence, motion } from "framer-motion";

export function Tail({ setisSettingsOpen }: { setisSettingsOpen: (arg: boolean) => void }) {
  const [direction, setDirection] = useState(1);
  const [notifications, setNotifications] = notificationsStore.use();
  const [view, setView] = useState<"Notifications" | "Resource Usage Stats" | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  useBlurMask(scrollRef);

  return (
    <div className="flex h-fit w-67 shrink-0 scrollbar-none flex-col p-1">
      <div className="flex h-fit w-full flex-col gap-2 rounded-md border-2 border-(--border-color)/20 p-1 py-1.5">
        <AnimatePresence mode="wait">
          <motion.div ref={scrollRef} animate={{ height: view ? "calc(var(--spacing) * 30)" : "0px" }} className="flex w-full shrink-0 scrollbar-none flex-col overflow-y-auto">
            <motion.div key={view} animate={{ x: 0 }} transition={{ duration: 0.2 }} className="flex h-full w-full flex-col" initial={{ x: direction === 0 ? "0" : direction === 1 ? "70%" : "-70%" }}>
              {view === "Resource Usage Stats" && <Stats />}
              {view === "Notifications" && (
                <div className="flex h-full w-full flex-col items-center gap-1">
                  {notifications.length ? (
                    notifications.map((n) => (
                      <Noti
                        n={n}
                        key={n.id}
                        containerRef={scrollRef}
                        onDismiss={(n) => setNotifications((_) => [..._.filter((__) => __.id !== n.id)])}
                        onSeen={(n) => setNotifications((arr) => [...arr.map((__) => (__.id !== n.id ? __ : { ...__, seen: true }))])}
                      />
                    ))
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3">
                      <div className="flex h-fit w-full items-center justify-center text-xs italic">You are all set !</div>
                      <div className="flex h-fit w-full items-center justify-center text-center text-xs italic opacity-70">Once you receive any notifications, they will appear here</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="flex h-fit w-full gap-2 p-1 pt-0">
          <div className="flex w-full flex-col px-1 text-[10px]">
            <div className="text-[10px] font-medium opacity-100">{view || `${pkg.name.toUpperCase()} - v${pkg.version}`}</div>
            <div className="flex h-fit w-full items-center gap-0.5 text-[9px]">
              {view === "Notifications" ? (
                [
                  { label: "Clear", className: "opacity-70", onClick: () => setNotifications([]) },
                  { label: "ALL", className: "cursor-pointer px-px hover:text-(--accent-color) hover:opacity-100", onClick: () => setNotifications([]) },
                  { label: "/", className: "opacity-60" },
                  { label: "SEEN", className: "cursor-pointer px-px hover:text-(--accent-color) hover:opacity-100", onClick: () => setNotifications((_) => [..._.filter((__) => !__.seen)]) },
                  { label: "notifications", className: "opacity-70" },
                ].map(({ label, className, onClick }, i) => <div key={i} className={className} onClick={onClick} children={label} />)
              ) : view === "Resource Usage Stats" ? (
                <div className="opacity-80">As provided by OS to Electron</div>
              ) : (
                <div className="opacity-80">{pkg.description}</div>
              )}
            </div>
          </div>

          <div className="flex flex-row items-center gap-1">
            <button
              onClick={() => (setDirection(!view || view === "Notifications" ? 0 : -1), setView(view === "Notifications" ? null : "Notifications"))}
              className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-(--border-color)/20 p-1 text-lg active:scale-95"
            >
              <LuInfo className="group-hover:scale-110" />
              {(notifications.filter((_) => !_.seen).length && (
                <div
                  children={notifications.filter((_) => !_.seen).length}
                  className="absolute -top-1 -right-1 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-(--accent-color) text-[10px] text-(--hover-color)"
                />
              )) ||
                null}
            </button>
            <button
              children={<RiDonutChartFill className="group-hover:scale-110" />}
              onClick={() => (setDirection(!view || view === "Resource Usage Stats" ? 0 : 1), setView(view === "Resource Usage Stats" ? null : "Resource Usage Stats"))}
              className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-(--border-color)/20 p-1 text-lg active:scale-95"
            />
            <button
              onClick={() => setisSettingsOpen(true)}
              children={<BsGearWide className="group-hover:scale-110" />}
              className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-(--border-color)/20 p-1 text-base active:scale-95"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
