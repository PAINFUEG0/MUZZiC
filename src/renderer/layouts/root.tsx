/** @format */

import { Outlet } from "react-router-dom";
import { Popup } from "../components/Popup";
import { useEffect, useState } from "react";
import { Navbar } from "../components/bars/navbar";
import { themeStore } from "../utils/globalStores";
import { Sidebar } from "../components/bars/sidebar";
import { Playbar } from "../components/bars/playbar";

export function Root() {
  const [theme] = themeStore.use();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", theme.color);
  }, [theme.color]);

  return (
    <div className="relative flex h-screen w-full shrink-0 flex-col overflow-hidden text-white">
      <Popup />

      <img
        src={theme.backgrground}
        style={{ filter: `blur(${"0px"})` }}
        className="absolute inset-0 -z-50 h-full w-full scale-110 object-cover"
      />
      <div className="absolute inset-0 -z-40 h-full w-full bg-white" style={{ opacity: theme.tint.white.overall }} />
      <div className="absolute inset-0 -z-30 h-full w-full bg-black" style={{ opacity: theme.tint.black.overall }} />

      <div className="relative flex h-full w-full flex-row overflow-hidden">
        <Sidebar isOpen={isOpen} />

        <div className="flex h-full w-full flex-col">
          <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
          <Outlet />
        </div>
      </div>

      <Playbar />
    </div>
  );
}
