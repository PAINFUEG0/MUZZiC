/** @format */

import { LuX } from "react-icons/lu";
import { useRef, useEffect } from "react";
import { NotificationData } from "../../stores";

type Props = {
  n: NotificationData;
  onSeen: (n: NotificationData) => void;
  onDismiss: (n: NotificationData) => void;
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
      <div className="flex h-fit w-full items-center text-[10px] opacity-70">{n.body}</div>
      <div className="flex h-fit w-full items-center justify-end gap-2 py-0.5 text-[10px]">
        <button className="flex h-fit w-fit cursor-pointer font-stretch-ultra-condensed opacity-70 hover:text-(--accent-color) hover:opacity-100">xxxxxx</button>
        <button className="flex h-fit w-fit cursor-pointer font-stretch-ultra-condensed opacity-70 hover:text-(--accent-color) hover:opacity-100">xxxxxx</button>
      </div>
    </div>
  );
}
