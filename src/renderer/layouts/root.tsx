/** @format */

import { Outlet } from "react-router-dom";
import { Popup } from "../components/Popup";
import { useEffect, useState } from "react";
import { Sidebar } from "../components/bars/sidebar";
import { Playbar } from "../components/bars/playbar";

export function Root() {
  const [mount, setMount] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => setMount(false), []);

  return (
    <div className="relative flex h-screen w-full shrink-0 flex-col">
      <Popup />

      <div className="relative flex h-full w-full flex-row overflow-hidden">
        <Sidebar isOpen={isOpen} isMount={mount} />

        <div className="flex h-full w-full flex-col">
          <div className="flex h-20 w-full shrink-0 bg-blue-200">
            <button className="border p-3" onClick={() => setIsOpen(!isOpen)} />
          </div>
          <Outlet />
        </div>
      </div>

      <Playbar />
    </div>
  );
}
