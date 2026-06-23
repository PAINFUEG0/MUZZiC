/** @format */

import { useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { MdFullscreen } from "react-icons/md";
import { searchBox, themeStore } from "../../../utils/globalStores";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbMinus, TbSearch } from "react-icons/tb";

export function Navbar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (arg: boolean) => void }) {
  const [theme] = themeStore.use();
  const [value, setValue] = searchBox.use();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && (e.preventDefault(), ref.current?.focus());
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative flex h-15 w-full shrink-0 flex-row items-center justify-between px-5 py-3 backdrop-blur-md">
      <div className="absolute inset-0 -z-9 h-full w-full bg-white" style={{ opacity: theme.tint.white.bars }} />
      <div className="absolute inset-0 -z-10 h-full w-full bg-black" style={{ opacity: theme.tint.black.bars }} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="aspect-square h-fit w-fit text-xl text-(--accent-color)"
        children={isOpen ? <TbLayoutSidebarLeftCollapse /> : <TbLayoutSidebarLeftExpand />}
      />

      <div className="flex w-full items-center justify-end gap-3">
        <div className="relative flex">
          <input
            ref={ref}
            type="text"
            value={value}
            spellCheck={false}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search for music / albums / artists . . ."
            onKeyDown={(e) => {
              e.key.toLowerCase() === "enter" && ref.current?.blur();
              e.key.toLowerCase() === "escape" && (ref.current?.blur(), setValue(""));
            }}
            style={{ paddingLeft: value ? "0.75rem" : "2.25rem", paddingRight: value ? "2.25rem" : "4rem" }}
            className="flex h-fit w-md flex-row items-center rounded-md bg-(--accent-color)/10 py-1.25 text-sm focus:outline-0"
          />

          <button
            className="absolute h-full text-(--theme)"
            children={<TbSearch className="text-xl text-(--accent-color)" />}
            style={{ left: value ? "auto" : "0.5rem", right: value ? "0.5rem" : "auto" }}
          />

          <div
            style={{ opacity: !value ? 0.8 : 0 }}
            className="absolute right-0 flex h-full shrink-0 flex-row items-center justify-center gap-1 px-2 text-xs font-bold"
          >
            <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="Ctrl" />
            <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="K" />
          </div>
        </div>

        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--accent-color)"
              children={<TbMinus />}
            />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--accent-color)"
              children={<MdFullscreen />}
            />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 p-0.5 text-xl text-(--accent-color)"
              children={<IoMdClose />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
