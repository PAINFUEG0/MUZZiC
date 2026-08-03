/** @format */

import { searchBox } from "../../stores";
import { TbSearch, TbX } from "react-icons/tb";
import { memo, useRef } from "react";

export const Search = memo(() => {
  const [value, setValue] = searchBox.use();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex w-[65%]">
      <input
        ref={ref}
        type="text"
        value={value}
        id="search-bar"
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

      {value && (
        <button
          onClick={() => setValue("")}
          children={<TbX className="text-[22px] text-(--accent-color)" />}
          className="absolute right-8 h-full cursor-pointer text-(--theme) opacity-90 active:scale-85"
        />
      )}

      <div style={{ opacity: !value ? 0.8 : 0 }} className="pointer-events-none absolute right-0 flex h-full shrink-0 flex-row items-center justify-center gap-1 px-2 text-xs font-bold">
        <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="Ctrl" />
        <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="K / F" />
      </div>
    </div>
  );
});
