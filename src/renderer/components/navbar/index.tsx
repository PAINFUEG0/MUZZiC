/** @format */

import { VU } from "./VU";
import { Search } from "./Search";
import { memo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { needsRestart } from "../../stores";
import { themeStore } from "../../stores/theme";
import { hexToRgba } from "../../../shared/helpers";
import { MdFullscreen, MdFullscreenExit, MdRestartAlt } from "react-icons/md";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbMinus } from "react-icons/tb";

export const Navbar = memo(({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) => {
  const [rs] = needsRestart.use();
  const [theme] = themeStore.use();
  const [fs, setFs] = useState(true);

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
        children={sidebarOpen ? <TbLayoutSidebarLeftCollapse /> : <TbLayoutSidebarLeftExpand />}
        className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.75 text-xl text-(--accent-color) transition-all duration-100 active:scale-99"
      />

      <VU />

      <div className="flex h-full w-full items-center justify-end gap-3">
        <Search />

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
});
