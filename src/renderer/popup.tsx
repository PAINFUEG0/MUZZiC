import { LuCheck, LuCross, LuInfo } from "react-icons/lu";
import { PopupPayload } from "../shared/types/utils";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export function PopupItem({ PL }: { PL: PopupPayload }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const start = performance.now();
    const DURATION = 3000;
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const remaining = Math.max(0, 1 - elapsed / DURATION);
      bar.style.width = `${(1 - remaining) * 100}%`;
      if (remaining > 0) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="relative flex flex-row p-3 border rounded-md items-center gap-2 w-full overflow-hidden"
      style={{
        backgroundColor:
          PL.type === "INFO_POPUP" ? "#00AAFF" : PL.type === "ERROR_POPUP" ? "#FF5500" : PL.type == "WARNING_POPUP" ? "#FFDD22" : "#88FF22",
      }}
    >
      <div className="font-medium">
        {PL.type === "INFO_POPUP" ? (
          <LuInfo />
        ) : PL.type === "ERROR_POPUP" ? (
          <LuCross />
        ) : PL.type == "WARNING_POPUP" ? (
          <LuInfo className="-scale-y-100" />
        ) : (
          <LuCheck />
        )}
      </div>

      <div className="text-xs font-medium">{PL.data}</div>

      <div
        className="absolute bottom-0 left-0 h-0.75 transition-none"
        style={{
          backgroundColor:
            PL.type === "INFO_POPUP"
              ? "#0088CC"
              : PL.type === "ERROR_POPUP"
                ? "#AA3300"
                : PL.type == "WARNING_POPUP"
                  ? "#AA8822"
                  : "#55CC22",
          width: "100%",
        }}
        ref={barRef}
      />
    </motion.div>
  );
}
