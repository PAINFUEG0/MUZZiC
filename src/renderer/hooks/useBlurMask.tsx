/** @format */

import { useLayoutEffect } from "react";

type Orientation = "vertical" | "horizontal";

export function useBlurMask(ref: React.RefObject<HTMLDivElement | null>, display = true, orientation: Orientation = "vertical") {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mask = () => {
      const isVertical = orientation === "vertical";
      const direction = isVertical ? "to bottom" : "to right";
      const start = isVertical ? el.scrollTop <= 0 : el.scrollLeft <= 0;
      const end = isVertical ? el.scrollHeight - el.scrollTop <= el.clientHeight + 1 : el.scrollWidth - el.scrollLeft <= el.clientWidth + 1;

      if (!display) return (el.style.maskImage = "none");

      el.style.maskImage =
        start && end
          ? "none"
          : start
            ? `linear-gradient(${direction}, black 80%, transparent 100%)`
            : end
              ? `linear-gradient(${direction}, transparent 0%, black 20%)`
              : `linear-gradient(${direction}, transparent 0%, black 20%, black 80%, transparent 100%)`;
    };

    const mutation = new MutationObserver(() => requestAnimationFrame(mask));
    mutation.observe(el, { childList: true, subtree: true });
    el.addEventListener("scroll", mask, { passive: true });

    return () => (mutation.disconnect(), el.removeEventListener("scroll", mask));
  }, [ref, display, orientation]);
}
