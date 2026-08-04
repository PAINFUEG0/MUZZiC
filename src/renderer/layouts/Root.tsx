/** @format */

import { Viewport } from "./Viewport";
import { Fullscreen } from "./FullScreen";
import { themeStore } from "../stores/theme";
import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";
import { Playbar } from "../components/playbar";
import { Modal } from "../components/utils/Modal";
import { memo, useEffect, useState } from "react";
import { Settings } from "../components/utils/Settings";
import { AnimatePresence, motion } from "framer-motion";
import { Keybinds } from "../components/playbar/Keybinds";

export const Root = memo(() => {
  const [theme] = themeStore.use();
  const [fullscreen, setFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    fullscreen ? document.documentElement.style.setProperty("--accent-color", "#FFFFFF") : document.documentElement.style.setProperty("--accent-color", theme.accent);
  }, [fullscreen, theme]);

  return (
    <div className="relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-xl border-2 border-(--border-color)/20 shadow-sm">
      <Keybinds fullscreen={fullscreen} setFullscreen={setFullscreen} />
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            key={"FS"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            children={<Fullscreen setShow={setFullscreen} />}
            className="absolute inset-0 z-500 h-full w-full overflow-hidden bg-black"
          />
        )}
      </AnimatePresence>

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
