/** @format */

import { IoMdClose } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { MdFullscreen, MdFullscreenExit, MdRestartAlt } from "react-icons/md";
import { needsRestart, searchBox, themeStore } from "../../../utils/globalStores";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbMinus, TbSearch } from "react-icons/tb";
import { hexToRgba } from "../../../../shared/helpers";

export function Navbar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) {
  const [rs] = needsRestart.use();
  const [theme] = themeStore.use();
  const [fs, setFs] = useState(true);
  const [value, setValue] = searchBox.use();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && (e.preventDefault(), ref.current?.focus());
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative flex h-15 w-full shrink-0 flex-row items-center justify-between px-5 py-3">
      <div
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          backdropFilter: `blur(${theme.navbar.blur})`,
          backgroundColor: hexToRgba(theme.navbar.tint.color, theme.navbar.tint.opacity),
        }}
      />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="aspect-square h-fit w-fit text-xl text-(--accent-color)"
        children={sidebarOpen ? <TbLayoutSidebarLeftCollapse /> : <TbLayoutSidebarLeftExpand />}
      />

      <div className="flex h-full w-full items-center justify-end gap-3">
        <div className="mx-5 flex h-full w-full" style={{ WebkitAppRegion: "drag" } as any} />

        <div className="relative flex">
          <input
            ref={ref}
            type="text"
            value={value}
            spellCheck={false}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search for music / albums / artists . . ."
            onKeyDown={(e) => {
              e.key.toLowerCase() === "enter" && ref.current?.blur();
              e.key.toLowerCase() === "escape" && (ref.current?.blur(), setValue(""));
            }}
            style={{ paddingLeft: value ? "0.75rem" : "2.25rem", paddingRight: value ? "2.25rem" : "4rem" }}
            className="flex h-fit w-md flex-row items-center rounded-md bg-(--accent-color)/10 py-1.25 text-sm focus:outline-0"
          />

          <button
            className="absolute h-full text-(--theme)"
            children={<TbSearch className="text-xl text-(--accent-color)" />}
            style={{ left: value ? "auto" : "0.5rem", right: value ? "0.5rem" : "auto" }}
          />

          <div
            style={{ opacity: !value ? 0.8 : 0 }}
            className="absolute right-0 flex h-full shrink-0 flex-row items-center justify-center gap-1 px-2 text-xs font-bold"
          >
            <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="Ctrl" />
            <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="K" />
          </div>
        </div>

        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-row items-center justify-center gap-2.5">
            {rs && (
              <button
                onClick={() => window.location.reload()}
                className="relative flex aspect-square h-7 w-7 animate-pulse cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--accent-color) transition-all duration-100 active:scale-99"
              >
                <MdRestartAlt className="mb-0.5" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-(--accent-color)" />
              </button>
            )}

            {[
              { Icon: <TbMinus />, onclick: () => window.api.minimize() },
              { Icon: !fs ? <MdFullscreenExit /> : <MdFullscreen />, onclick: () => window.api.fullscreen().then(() => setFs(!fs)) },
              { Icon: <IoMdClose />, onclick: () => window.api.close() },
            ].map((b, i) => (
              <button
                key={i}
                children={b.Icon}
                onClick={b.onclick}
                className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--accent-color) transition-all duration-100 active:scale-99"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
