/** @format */

import { Outlet } from "react-router-dom";
import { Popup } from "../components/Popup";

export function Root() {
  return (
    <div className="relative flex h-screen w-full shrink-0">
      <Popup />
      <Outlet />
    </div>
  );
}
