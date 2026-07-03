/** @format */

import { themes } from "../utils/themes";
import { themeStore } from "../utils/globalStores";

export function Settings() {
  const [theme, setTheme] = themeStore.use();

  return (
    <div className="flex w-full flex-row items-center justify-between">
      {themes.map((t, i) => (
        <button
          key={i}
          style={{ backgroundColor: t.color }}
          className={
            `aspect-square h-3 cursor-pointer rounded-full ` +
            (JSON.stringify(t) === JSON.stringify(theme) ? `border-3 border-(--border-color)` : "")
          }
          onClick={(e) => {
            const x = e.clientX;
            const y = e.clientY;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

            const switchTheme = () => {
              setTheme(t);
              document.documentElement.style.setProperty("--accent-color", t.color);
              document.documentElement.style.setProperty("--text-color", t.type === "dark" ? "#ffffff" : "#000000");
              document.documentElement.style.setProperty("--hover-color", t.type === "dark" ? "#000000" : "#ffffff");
              document.documentElement.style.setProperty("--border-color", t.type === "dark" ? "#ffffff" : "#000000");
            };

            document
              .startViewTransition(switchTheme)
              .ready.then(() =>
                document.documentElement.animate(
                  { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
                  { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
                ),
              ) || switchTheme();
          }}
        />
      ))}
    </div>
  );
}
