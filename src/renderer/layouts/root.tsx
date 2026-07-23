/** @format */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Popup } from "../components/Popup";
import { Modal } from "../components/Modal";
import { Settings } from "../pages/Settings";
import { Navbar } from "../components/bars/navbar";
import { Sidebar } from "../components/bars/sidebar";
import { Playbar } from "../components/bars/playbar";

export function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-xl border-2 border-(--border-color)/20 shadow-sm">
      <Popup />

      <div className="relative flex h-full w-full flex-row overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSettingsOpen={setSettingsOpen} />

        <div className="flex h-full w-full flex-col">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <Outlet />
        </div>
      </div>

      <Playbar />

      <Modal
        open={settingsOpen}
        children={<Settings />}
        setOpen={setSettingsOpen}
        className="h-fit min-h-[50%] w-fit min-w-[50%] border-2 border-(--border-color)/20 bg-(--hover-color)/25 text-(--text-color)"
      />
    </div>
  );
}
