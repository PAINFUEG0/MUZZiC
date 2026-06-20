/** @format */

import { Outlet } from "react-router-dom";
import { Popup } from "../components/Popup";
import { useState } from "react";
import { Navbar } from "../components/bars/navbar";
import { Sidebar } from "../components/bars/sidebar";
import { Playbar } from "../components/bars/playbar";

export function Root() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-xl border-2 border-(--border-color)/20 shadow-sm">
      <Popup />

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
