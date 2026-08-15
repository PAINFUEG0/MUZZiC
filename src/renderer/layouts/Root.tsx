/** @format */

import { Viewport } from "./Viewport";
import { memo, useState } from "react";
import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";
import { Playbar } from "../components/playbar";
import { useKeybinds } from "../utils/Keybinds";
import { Modal } from "../components/utils/Modal";
import { Settings } from "../components/utils/Settings";

export const Root = memo(({ fullscreen, setFullscreen }: { fullscreen: boolean; setFullscreen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useKeybinds(fullscreen, setFullscreen);

  return (
    <div className="relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-xl border-2 border-(--border-color)/20 shadow-sm">
      <div className="relative flex h-full w-full flex-row overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSettingsOpen={setSettingsOpen} />

        <div className="flex h-full w-full flex-col">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <Viewport />
        </div>
      </div>

      <Playbar setFullscreen={setFullscreen} />

      <Modal
        open={settingsOpen}
        children={<Settings />}
        setOpen={setSettingsOpen}
        className="h-fit min-h-[50%] w-fit min-w-[50%] border-2 border-(--border-color)/20 bg-(--hover-color)/25 text-(--text-color)"
      />
    </div>
  );
});
