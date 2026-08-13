/** @format */

import { memo, useEffect } from "react";
import { Liked } from "../pages/Liked";
import { motion } from "framer-motion";
import { Queue } from "../pages/Queue";
import { List } from "../pages/Explorer";
import { Albums } from "../pages/Albums";
import { Tracks } from "../pages/Tracks";
import { Artists } from "../pages/Artists";
import { themeStore } from "../stores/theme";
import { Playlist } from "../pages/Playlist";
import { Equalizer } from "../pages/Equalizer";
import { hexToRgba } from "../../shared/helpers";
import { sceneStore, searchBox, selected, selectMode } from "../stores";

export const Viewport = memo(() => {
  let page;
  const [scene] = sceneStore.use();
  const [theme] = themeStore.use();
  const [, setQuery] = searchBox.use();
  const [, setSelections] = selected.use();
  const [, setSelectionMode] = selectMode.use();

  useEffect(() => (setQuery(""), setSelections([]), setSelectionMode(false)), [scene.scene]);

  switch (scene.scene) {
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
    case "liked":
      page = <Liked />;
      break;
    case "queue":
      page = <Queue />;
      break;
    case "equalizer":
      page = <Equalizer />;
      break;
    case "playlist":
      page = <Playlist K={scene.K!} />;
      break;
  }

  return (
    <motion.div
      key={scene.scene}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, x: "-20%" }}
      initial={{ opacity: 0, x: "20%" }}
      className="relative flex h-full w-full overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          backdropFilter: `blur(${theme.viewport.blur})`,
          backgroundColor: hexToRgba(theme.viewport.tint.color, theme.viewport.tint.opacity),
        }}
      />
      {page}
    </motion.div>
  );
});
