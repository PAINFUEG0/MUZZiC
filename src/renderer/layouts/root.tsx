import { Popup } from "../components/Popup";
import { List } from "../pages/List";
import { treeStore } from "../utils/Store";

export function Root() {
  const [list] = treeStore.use();

  return (
    <div className="relative h-screen w-full flex shrink-0">
      <Popup />
      {list && <List />}
    </div>
  );
}
