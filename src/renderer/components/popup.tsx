import { useEffect } from "react";
import { PopupItem } from "./PopupItem";
import { AnimatePresence } from "framer-motion";
import { createGlobalStore } from "../utils/Store";
import type { PopupPayload } from "../../shared/types/utils";

const popupStore = createGlobalStore<PopupPayload[]>([]);

export function Popup() {
  const [popups, setPopups] = popupStore.use();

  useEffect(() => {
    let ws: WebSocket;

    (async () => {
      const port = await window.api.getPort();
      ws = new WebSocket(`http://localhost:${port}/ws`);

      ws.onmessage = (e) => {
        const message = JSON.parse(e.data);

        if (!["INFO_POPUP", "ERROR_POPUP", "WARNING_POPUP", "SUCCESS_POPUP"].includes(message.type)) return;

        setPopups((prev) => [...prev.slice(0, 7), message]);
        setTimeout(() => setPopups((prev) => prev.filter((p) => p !== message)), 3000);
      };
    })();

    return () => ws.close();
  }, []);

  return (
    <div className="absolute top-0 right-0 z-100 h-full w-[20dvw] flex shrink-0 flex-col gap-2 justify-end p-3">
      <AnimatePresence>{popups && popups.map((p) => <PopupItem PL={p} key={JSON.stringify(p)} />)}</AnimatePresence>
    </div>
  );
}
