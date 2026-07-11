/** @format */

import { motion } from "framer-motion";
import { List } from "../pages/Explorer";
import { Albums } from "../pages/Albums";
import { Tracks } from "../pages/Tracks";
import { Artists } from "../pages/Artists";
import { view } from "../utils/globalStores";

export function Viewport() {
  let page;
  const [state] = view.use();
  // const [theme] = themeStore.use();

  switch (state.scene) {
    case "explorer":
      page = <List />;
      break;
    case "tracks":
      page = <Tracks />;
      break;
    case "albums":
      page = <Albums />;
      break;
    case "artists":
      page = <Artists />;
      break;
  }

  return (
    <motion.div
      key={state.scene}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, x: "-20%" }}
      initial={{ opacity: 0, x: "20%" }}
      className="relative flex h-full w-full overflow-hidden"
    >
      {page}
    </motion.div>
  );
}
