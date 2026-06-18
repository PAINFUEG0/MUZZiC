/** @format */

import { IoMdClose } from "react-icons/io";
import { MdFullscreen } from "react-icons/md";
import { themeStore } from "../../../utils/globalStores";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbMinus } from "react-icons/tb";

export function Navbar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (arg: boolean) => void }) {
  const [theme] = themeStore.use();

  return (
    <div className="relative flex h-20 w-full shrink-0 flex-row items-center justify-between px-5 py-3 backdrop-blur-md">
      <div className="absolute inset-0 -z-9 h-full w-full bg-white" style={{ opacity: theme.tint.white.bars }} />
      <div className="absolute inset-0 -z-10 h-full w-full bg-black" style={{ opacity: theme.tint.black.bars }} />

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
  );
}
