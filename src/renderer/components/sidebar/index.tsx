/** @format */

import { Head } from "./Head";
import { Body } from "./Body";
import { Tail } from "./Tail";
import { motion } from "framer-motion";
import { themeStore } from "../../utils/themes";
import { hexToRgba } from "../../../shared/helpers";

export function Sidebar({ sidebarOpen, setSettingsOpen }: { sidebarOpen: boolean; setSettingsOpen: (arg: boolean) => void }) {
  const [theme] = themeStore.use();

  return (
    <motion.div
      animate={{ width: sidebarOpen ? "calc(var(--spacing) * 67)" : 0 }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          backdropFilter: `blur(${theme.sidebar.blur})`,
          backgroundColor: hexToRgba(theme.sidebar.tint.color, theme.sidebar.tint.opacity),
        }}
      />

      <Head />
      <Body />
      <Tail setisSettingsOpen={setSettingsOpen} />
    </motion.div>
  );
}
