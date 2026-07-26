/** @format */

import { Modal } from "../utils/Modal";
import { LuInfo } from "react-icons/lu";
import { sleepTimer } from "../../utils/stores";
import { Dispatch, memo, SetStateAction, useEffect, useState } from "react";

type T = ReturnType<(typeof sleepTimer)["use"]>;
type Props = { show: boolean; setShow: Dispatch<SetStateAction<boolean>>; sleepTime: T[0]; setSleepTime: T[1] };

export const Sleep = memo(({ show, setShow, sleepTime, setSleepTime }: Props) => {
  const [current, setCurrent] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrent(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Modal
      open={show}
      setOpen={setShow}
      className="z-100 h-fit w-fit border-2 border-(--border-color)/20 bg-(--hover-color)/45 text-(--text-color)"
    >
      <div className="flex flex-col">
        <div className="mb-3 text-lg font-medium">Select sleep mode timeout</div>

        <div className="flex flex-row items-center gap-1.5 py-2 text-xs">
          <LuInfo className="text-(--accent-color)" />
          {!sleepTime && <div className="opacity-70">You have no ongoing sleep timer. Sleep mode is disabled.</div>}
          {sleepTime ? (
            <div className="opacity-70">
              You have an ongoing sleep timer with {Math.max(0, Math.floor((sleepTime - current) / (60 * 1000)))} minutes and{" "}
              {Math.max(0, Math.floor(((sleepTime - current) % (60 * 1000)) / 1000))} seconds remaining.
            </div>
          ) : null}
        </div>
        <div className="mb-5 flex flex-row items-center gap-1.5 text-xs">
          <LuInfo className="text-(--accent-color)" />
          <div className="opacity-70">Selecting an option will reset the current sleep timer ( if any ) and/or start a new one.</div>
        </div>

        <div className="flex flex-row items-center gap-1">
          {[5, 15, 30, 60, 120].map((_) => {
            return (
              <button
                children={`${_} minutes`}
                onClick={() => setSleepTime(Date.now() + _ * 60 * 1000)}
                className="flex h-fit w-full cursor-pointer flex-row items-center justify-center rounded-md border-2 border-(--border-color)/20 p-1 text-sm font-medium transition-all duration-150 active:scale-90"
              />
            );
          })}
        </div>

        <button
          children="Clear sleep timer"
          onClick={() => setSleepTime(0)}
          className="mt-2 flex h-fit w-full cursor-pointer flex-row items-center justify-center rounded-md border-2 border-(--border-color)/20 p-1 transition-all duration-150 active:scale-95"
        />
      </div>
    </Modal>
  );
});
