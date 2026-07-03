/** @format */

import { useEffect } from "react";
import { PopupItem } from "./PopupItem";
import { AnimatePresence } from "framer-motion";
import { createGlobalStore } from "../utils/globalStores";
import type { MessagePayload, PopupPayload } from "../../shared/types";

const popupStore = createGlobalStore<PopupPayload[]>([]);

export function Popup() {
  const [popups, setPopups] = popupStore.use();

  useEffect(() => {
    let ws: WebSocket;

    (async () => {
      const port = await window.api.getPort();
      ws = new WebSocket(`ws://localhost:${port}/ws`);

      ws.onmessage = (e) => {
        const message = JSON.parse(e.data) as MessagePayload;

        if (message.type !== "POPUP") return;

        setPopups((prev) => [...prev.slice(0, 7), message]);
        setTimeout(() => setPopups((prev) => prev.filter((p) => p !== message)), message.duration);
      };
    })();

    return () => ws.close();
  }, []);

  return (
    <div className="pointer-events-none absolute top-0 right-0 z-100 flex h-full w-[20dvw] shrink-0 flex-col justify-end gap-2 p-3">
      <AnimatePresence>{popups && popups.map((p) => <PopupItem PL={p} key={JSON.stringify(p)} />)}</AnimatePresence>
    </div>
  );
}
