import { Outlet } from "react-router-dom";
import { Popup } from "../components/Popup";

export function Root() {
  return (
    <div className="relative h-screen w-full flex shrink-0">
      <Popup />
      <Outlet />
    </div>
  );
}
