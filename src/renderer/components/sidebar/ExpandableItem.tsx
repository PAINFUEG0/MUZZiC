/** @format */

import { FaChevronUp } from "react-icons/fa6";
import { ReactNode, useState, JSX } from "react";

export type ExpandableItemProps = { label: string; collapsable: boolean; icon: ReactNode; defaultOpen?: boolean; items: JSX.Element[] };

export const ExpandableItem = ({ icon, label, items, collapsable, defaultOpen }: ExpandableItemProps) => {
  const [show, setShow] = useState(defaultOpen);

  const item = (
    <div
      key={label}
      onClick={() => setShow(!show)}
      className="group flex w-full shrink-0 cursor-pointer flex-row items-center gap-3 rounded-sm p-1 transition-all duration-100 hover:bg-(--hover-color)/25 active:scale-96"
    >
      <div className="h-full w-1 shrink-0 rounded-sm group-hover:bg-(--accent-color)" />
      <div className="text-base group-hover:text-(--accent-color)" children={icon} />
      <div className="p-1 text-[13px]" children={label} />
      <div className="flex w-full flex-row items-center justify-end gap-3 px-2" children={<FaChevronUp className={"text-[10px] transition-all duration-150 " + (show ? "" : " rotate-180")} />} />
    </div>
  );

  return show || !collapsable ? [item, items] : item;
};
