/** @format */

import { memo, useState } from "react";
import { themes } from "../../stores/theme";
import { FaCaretDown } from "react-icons/fa6";

import type { Theme } from "../../stores/theme";
import { LuWandSparkles } from "react-icons/lu";

export const ThemeSelector = memo(({ theme, setTheme }: { theme: Theme; setTheme: React.Dispatch<React.SetStateAction<Theme>> }) => {
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  return (
    <div className="relative flex w-fit cursor-pointer flex-row items-center gap-2 text-sm font-medium" onClick={() => setShowThemeSelector(!showThemeSelector)}>
      <LuWandSparkles className="text-(--accent-color)" />
      <div className="-ml-0.5">Current color theme is</div>
      <div className="text-(--accent-color)">
        {theme.name
          .split(" ")
          .map((_) => _.charAt(0).toUpperCase() + _.slice(1).toLowerCase())
          .join(" ")}
      </div>
      <FaCaretDown className={"pointer-events-none opacity-50 transition-all duration-100 " + (showThemeSelector ? "-rotate-180" : "")} />

      {showThemeSelector && (
        <div className="absolute top-8 z-500 flex max-h-[15.75dvh] w-100 scrollbar-none flex-col overflow-y-auto rounded-md border-2 border-(--border-color)/20 bg-black/80 backdrop-blur-[10px]">
          {themes.map((theme, i, arr) => (
            <div
              key={theme.name}
              onClick={() => setTheme(theme)}
              className={
                "flex w-full cursor-pointer items-center gap-1.5 border-(--border-color)/20 bg-(--hover-color)/5 px-2 py-0.5 text-xs hover:bg-(--hover-color)/20 " +
                (i === arr.length - 1 ? "" : "border-b")
              }
            >
              <div className="aspect-square h-2 rounded-full" style={{ backgroundColor: theme.accentColor }} />
              <div>
                {theme.name
                  .split(" ")
                  .map((_) => _.charAt(0).toUpperCase() + _.slice(1).toLowerCase())
                  .join(" ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
