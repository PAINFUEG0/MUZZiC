/** @format */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Popup } from "../components/Popup";
import { Sidebar } from "../components/bars/sidebar";
import { Playbar } from "../components/bars/playbar";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbMinus } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { MdFullscreen } from "react-icons/md";

const bg =
  // "https://images.unsplash.com/photo-1655039448514-833b60a552e1?q=80&w=859&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  // "https://images.unsplash.com/photo-1536147116438-62679a5e01f2?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  // "https://images.unsplash.com/photo-1530533718754-001d2668365a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  "https://images.unsplash.com/photo-1773746685112-647c4f81344c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
export function Root() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative flex h-screen w-full shrink-0 flex-col overflow-hidden text-white">
      <Popup />

      <img src={bg} className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover blur" />
      <div className="absolute inset-0 -z-10 h-full w-full bg-black/70" />

      <div className="relative flex h-full w-full flex-row overflow-hidden">
        <Sidebar isOpen={isOpen} />

        <div className="flex h-full w-full flex-col">
          <div className="flex h-20 w-full shrink-0 flex-row items-center justify-between bg-black/20 px-5 py-3 backdrop-blur-md">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="aspect-square h-fit w-fit text-xl text-(--theme)"
              children={isOpen ? <TbLayoutSidebarLeftCollapse /> : <TbLayoutSidebarLeftExpand />}
            />

            <div className="flex flex-row items-center justify-end">
              <div className="flex flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--theme)"
                  children={<TbMinus />}
                />

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--theme)"
                  children={<MdFullscreen />}
                />

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--theme)"
                  children={<IoMdClose />}
                />
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>

      <Playbar />
    </div>
  );
}
