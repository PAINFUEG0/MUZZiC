/** @format */

import { Head } from "./Head";
import { Body } from "./Body";
import { motion } from "framer-motion";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.div
      animate={{ width: isOpen ? "calc(var(--spacing) * 65)" : 0 }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden"
    >
      <Head />
      <Body />
    </motion.div>
  );
}
