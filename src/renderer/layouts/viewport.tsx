/** @format */

import { List } from "../pages/list";
import { Tracks } from "../pages/Tracks";
import { Albums } from "../pages/Albums";
import { Artists } from "../pages/Artists";
import { view } from "../utils/globalStores";
import { AnimatePresence, motion } from "framer-motion";

export function Viewport() {
  let page;
  const [state] = view.use();

  switch (state.scene) {
    case "tracks":
      page = <Tracks />;
      break;
    case "explorer":
      page = <List />;
      break;
    case "albums":
      page = <Albums />;
      break;
    case "artists":
      page = <Artists />;
      break;
    default:
      page = <List />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        children={page}
        key={state.scene}
        exit={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        initial={{ opacity: 0, x: 10 }}
        className="flex h-full w-full overflow-hidden"
      />
    </AnimatePresence>
  );
}
