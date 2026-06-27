/** @format */

import { List } from "../pages/list";
import { Tracks } from "../pages/tracks";
import { view } from "../utils/globalStores";

export function Viewport() {
  const [_] = view.use();
  if (_.scene === "tracks") return <Tracks />;
  if (_.scene === "explorer") return <List />;
}
