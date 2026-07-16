/** @format */

import { useState } from "react";

export function useMask(ref: React.RefObject<HTMLDivElement | null>) {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  if (!ref.current) return;

  ref.current!.addEventListener("scroll", () => {
    const el = ref.current;
    el && setAtTop(el.scrollTop <= 0);
    el && setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
  });

  ref.current!.style.maskImage =
    atTop && atBottom
      ? "none"
      : atTop
        ? "linear-gradient(to bottom, black 95%, transparent 100%)"
        : atBottom
          ? "linear-gradient(to bottom, transparent 0%, black 5%)"
          : "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)";
}
