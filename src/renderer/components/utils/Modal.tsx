/** @format */

import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { RxCross1 } from "react-icons/rx";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  className?: string;
  children: ReactNode;
  onClose?: () => void | Promise<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const openModalStack: string[] = [];

export const Modal = ({ open, children, onClose, setOpen, className }: ModalProps) => {
  const id = useId();
  const navRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => (setOpen(false), onClose?.()), [setOpen, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => event.key === "Escape" && openModalStack[openModalStack.length - 1] === id && close();

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close, id]);

  useEffect(() => {
    if (!open) return;
    openModalStack.push(id);
    return () => void (openModalStack.indexOf(id) !== -1 && openModalStack.splice(openModalStack.indexOf(id), 1));
  }, [open, id]);

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key={+open}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex h-full w-full items-center justify-center bg-(--hover-color)/45 backdrop-blur-[14px]">
            <div className="absolute inset-0 h-full w-full" onClick={close} />
            <div ref={navRef} className={twMerge("relative mx-3 flex max-h-[95%] w-md flex-col gap-3 rounded-xl bg-[#151515] px-3 py-4 shadow-lg md:px-5", className)}>
              <div className="flex h-full w-full scrollbar-none overflow-auto">{children}</div>
              <div className="absolute top-5 right-5 z-100 cursor-pointer" children={<RxCross1 onClick={close} />} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
