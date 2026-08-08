/** @format */

import { LuX } from "react-icons/lu";
import { useRef, useEffect } from "react";
import { notificationsStore } from "../../stores";

type N = ReturnType<(typeof notificationsStore)["use"]>;

type Props = {
  n: N[0][number];
  onSeen: (n: N[0][number]) => void;
  onDismiss: (n: N[0][number]) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export function Noti({ n, containerRef, onSeen, onDismiss }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (n.seen || !rowRef.current || !containerRef.current) return;

    let timer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) timer = setTimeout(() => onSeen(n), (0.2 + 0.5) * 1000);
        else clearTimeout(timer);
      },
      { root: containerRef.current, threshold: 0.3 + 0.5 },
    );

    observer.observe(rowRef.current);
    return () => (clearTimeout(timer), observer.disconnect());
  }, [n.seen]);

  return (
    <div ref={rowRef} className="relative flex h-fit w-full flex-col items-center rounded-sm border-2 border-(--border-color)/20 px-2 py-1">
      <LuX className="absolute top-1 right-1 cursor-pointer text-xs opacity-50 hover:opacity-100 active:scale-80" onClick={() => onDismiss(n)} />
      <div className="flex h-fit w-full items-center gap-1 text-[10px] font-medium">
        <div className="aflex h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent-color)" style={{ opacity: !n.seen ? 1 : 0.3 }} />
        {n.title}
      </div>
      {n.body}
    </div>
  );
}
