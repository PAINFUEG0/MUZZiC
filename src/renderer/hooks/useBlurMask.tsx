/** @format */

import { useEffect } from "react";

export function useBlurMask(ref: React.RefObject<HTMLDivElement | null>, display = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mask = () => {
      const top = el.scrollTop <= 0;
      const bottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;

      el.style.maskImage = display
        ? top && bottom
          ? "none"
          : top
            ? "linear-gradient(to bottom, black 95%, transparent 100%)"
            : bottom
              ? "linear-gradient(to bottom, transparent 0%, black 5%)"
              : "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)"
        : "none";
    };

    mask();

    el.addEventListener("scroll", mask, { passive: true });
    return () => el.removeEventListener("scroll", mask);
  }, [ref, display]);
}
