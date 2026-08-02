/** @format */

import { memo } from "react";

export const DirectoryGrid = memo(({ index, len, children }: { index: number; len: number; children: React.ReactNode }) => (
  <div
    children={children}
    className={
      `grid grid-cols-5 gap-x-3 border-(--border-color)/20 bg-(--hover-color)/5 px-5 backdrop-blur-md ` +
      `${
        len === 1
          ? "rounded-md border-2 pt-5 pb-5"
          : index === 0
            ? "rounded-md rounded-b-none border-2 border-b-0 pt-5 pb-0.75"
            : index === len - 1
              ? "rounded-md rounded-t-none border-2 border-t-0 pt-0.75 pb-5"
              : "border-x-2 pt-0.75 pb-0.75"
      } `
    }
  />
));
