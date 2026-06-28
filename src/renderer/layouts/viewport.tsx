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
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        children={page}
        key={state.scene}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "-20%" }}
        initial={{ opacity: 0, x: "20%" }}
        className="flex h-full w-full overflow-hidden"
        transition={{ duration: 0.2, ease: "easeIn" }}
      />
    </AnimatePresence>
  );
}
