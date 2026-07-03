/** @format */

import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { RxCross1 } from "react-icons/rx";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
  open: boolean;
  className?: string;
  children: ReactNode;
  onClose?: () => void | Promise<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Modal = ({ open, children, onClose, setOpen, className }: ModalProps) => {
  const navRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [setOpen, onClose]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) =>
      navRef.current && !navRef.current.contains(event.target as Node) && close();

    const handleKeyDown = (event: KeyboardEvent) => event.key === "Escape" && close();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open, setOpen, close]);

  // if (!open) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key={+open}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--hover-color)/50 backdrop-blur-sm"
        >
          <div
            ref={navRef}
            className={twMerge(
              "relative mx-3 flex max-h-[95%] w-md flex-col gap-3 rounded-xl bg-[#151515] px-3 py-4 shadow-lg md:px-5",
              className,
            )}
          >
            <div className="flex h-full w-full overflow-auto">{children}</div>
            <div className="text-primary absolute top-5 right-5 z-100 cursor-pointer" children={<RxCross1 onClick={close} />} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
