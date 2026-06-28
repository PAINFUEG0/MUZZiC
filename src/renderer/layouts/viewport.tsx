/** @format */

import { List } from "../pages/list";
import { Tracks } from "../pages/Tracks";
import { Albums } from "../pages/Albums";
import { Artists } from "../pages/Artists";
import { view } from "../utils/globalStores";

export function Viewport() {
  const [_] = view.use();
  if (_.scene === "tracks") return <Tracks />;
  if (_.scene === "explorer") return <List />;
  if (_.scene === "albums") return <Albums />;
  if (_.scene === "artists") return <Artists />;
}
