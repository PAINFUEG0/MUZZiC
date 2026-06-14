import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { PopupPayload } from "../../shared/types/utils";
import { LuCheck, LuCross, LuInfo } from "react-icons/lu";

const styles = {
  INFO: { bg: "#00AAFF", bar: "#00AAFF", icon: <LuInfo /> },
  ERROR: { bg: "#FF5500", bar: "#FF5500", icon: <LuCross /> },
  SUCCESS: { bg: "#88FF22", bar: "#88FF22", icon: <LuCheck /> },
  WARNING: { bg: "#FFDD22", bar: "#FFDD22", icon: <LuInfo className="-scale-y-100" /> },
};

export function PopupItem({ PL }: { PL: PopupPayload }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let raf: number;
    const DURATION = PL.duration;
    const start = performance.now();

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
      exit={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: 10 }}
      style={{ backgroundColor: styles[PL.category].bg }}
      className="relative flex flex-row p-3 border rounded-md items-center gap-2 w-full overflow-hidden"
    >
      <div className="font-medium">{styles[PL.category].icon}</div>

      <div className="text-xs font-medium">{PL.data}</div>

      <div
        ref={barRef}
        style={{ width: "100%", backgroundColor: styles[PL.category].bar }}
        className="absolute bottom-0 left-0 h-0.75 transition-none"
      />
    </motion.div>
  );
}
