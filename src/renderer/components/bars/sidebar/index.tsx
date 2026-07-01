/** @format */

import { Head } from "./Head";
import { Body } from "./Body";
import { Tail } from "./Tail";
import { motion } from "framer-motion";
import { themeStore } from "../../../utils/globalStores";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const [theme] = themeStore.use();

  return (
    <motion.div
      animate={{ width: isOpen ? "calc(var(--spacing) * 65)" : 0 }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden"
    >
      <div className="absolute inset-0 -z-9 h-full w-full bg-white" style={{ opacity: theme.tint.white.bars }} />
      <div className="absolute inset-0 -z-10 h-full w-full bg-black" style={{ opacity: theme.tint.black.bars }} />

      <Head />
      <Body />
      <Tail />
    </motion.div>
  );
}
