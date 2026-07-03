/** @format */

import { themes } from "../utils/themes";
import { useEffect, useRef } from "react";
import { themeStore } from "../utils/globalStores";

export function Settings() {
  const [currentTheme, setTheme] = themeStore.use();

  const ref1 = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      void (
        ref1.current &&
        ((ref1.current.onmouseenter = () => ref1.current!.focus()), (ref1.current.onmouseleave = () => ref1.current!.blur()))
      ),
  );

  return (
    <div className="flex h-[85dvh] w-[85dvw] scrollbar-none flex-col gap-1 overflow-y-auto">
      <div className="text-3xl font-bold">Settings</div>
      <div className="text-[11px] opacity-50">Please remember to save the settings using the button below</div>

      <div className="pt-3 pb-1 text-sm font-medium">Select color theme</div>

      <div className="grid grid-cols-4 gap-5 p-3">
        {themes.map((theme, i) => (
          <button
            key={i}
            children={<img className="h-fit w-full rounded-sm" src={`./${i + 1}.png`} />}
            className="flex h-fit w-full shrink-0 cursor-pointer rounded-md border-2 border-(--border-color)/20 p-1 transition-all duration-150 hover:scale-105 active:scale-95"
            onClick={(e) => {
              if (JSON.stringify(theme) === JSON.stringify(currentTheme)) return;

              const x = e.clientX;
              const y = e.clientY;
              const w = window.innerWidth;
              const h = window.innerHeight;
              const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

              const switchTheme = () => {
                setTheme(theme);
                localStorage.setItem("theme", i.toString());
                document.documentElement.style.setProperty("--accent-color", theme.color);
                document.documentElement.style.setProperty("--text-color", theme.type === "dark" ? "#ffffff" : "#000000");
                document.documentElement.style.setProperty("--hover-color", theme.type === "dark" ? "#000000" : "#ffffff");
                document.documentElement.style.setProperty("--border-color", theme.type === "dark" ? "#ffffff" : "#000000");
              };

              return document
                .startViewTransition(switchTheme)
                .ready.then(() =>
                  document.documentElement.animate(
                    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
                    { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
                  ),
                );
            }}
          />
        ))}
      </div>
    </div>
  );
}
