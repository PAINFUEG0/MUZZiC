/** @format */

import { Track } from "../../../shared/types";
import { parseLRC } from "../../utils/parseLRC";
import { memo, useEffect, useMemo, useRef } from "react";
import { playerMethods, playerProgress } from "../../stores";

export const Lyrics = memo(({ lyrics }: { lyrics: Track["lyrics"] }) => {
  const isFirstScroll = useRef(true);
  const [methods] = playerMethods.use();
  const [progress] = playerProgress.use();
  const activeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseLRC(lyrics), [lyrics]);
  const _progress = useMemo(() => progress + 1, [progress]);

  useEffect(() => {
    const [el, container] = [activeRef.current, scrollRef.current];
    if (!(el && container)) return;

    container.scrollTo({
      top: el.offsetTop - (container.offsetTop + container.offsetHeight / 2.75),
      behavior: isFirstScroll.current ? ((isFirstScroll.current = false), "instant") : "smooth",
    });
  }, [parsed.lines.find((l) => _progress >= l.start / 1000 && _progress < (l.end / 1000 || Infinity))]);

  return (
    <div
      ref={scrollRef}
      style={{
        maskImage: "linear-gradient(to bottom, transparent 5%, black 60%, transparent 92%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 5%, black 60%, transparent 92%)",
      }}
      className="flex h-full w-full scrollbar-none flex-col items-center gap-7 overflow-auto p-30 text-center text-4xl font-bold"
    >
      {lyrics !== "No lyrics found" ? (
        <div
          key="music"
          children=". . . ♫ . . ."
          onClick={() => methods.seekTo(0)}
          ref={_progress < parsed.lines[0]!.start / 1000 ? activeRef : null}
          className={`h-fit shrink-0 wrap-anywhere transition-all duration-300 ${_progress < parsed.lines[0]!.start / 1000 ? "scale-130 opacity-70" : "opacity-15"}`}
        />
      ) : null}

      {lyrics !== "No lyrics found"
        ? parsed.lines.map((l, i) => {
            const isActive = _progress >= l.start / 1000 && _progress < (l.end / 1000 || Infinity);
            return (
              <div
                key={i}
                children={l.text}
                ref={isActive ? activeRef : null}
                className={`h-fit max-w-[85%] shrink-0 wrap-anywhere transition-all duration-300 ${isActive ? "scale-130 opacity-70" : "opacity-15"}`}
              />
            );
          })
        : null}
    </div>
  );
});
