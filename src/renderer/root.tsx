import { List } from "./list";
import { PopupItem } from "./popup";
import { createGlobalStore } from "./store";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { PopupPayload } from "../shared/types/utils";

const store = createGlobalStore<PopupPayload[]>([]);

export function Root() {
  const [data, setData] = store.use();
  const [list, setList] = useState<any>(null);

  useEffect(() => {
    (async () => {
      //@ts-ignore
      const port = await window.api.getPort();

      console.log(`Connecting: http://localhost:${port}/ws`);
      const ws = new WebSocket(`http://localhost:${port}/ws`);

      ws.onmessage = (e) => {
        const message = JSON.parse(e.data) as PopupPayload;
        setData((prev) => [...prev, message]);
        setTimeout(() => setData((prev) => prev.filter((p) => p !== message)), 3000);
        // setInterval(() => {
        //   const _ = { type: "INFO_POPUP", data: "Hello World " + Math.random() } as const;
        //   setData((prev) => [...prev, _]);
        //   setTimeout(() => setData((prev) => prev.filter((p) => p !== _)), 3000);
        // }, 500);
      };

      ws.onopen = async () => {
        console.log("Connected !!! Requesting binary validation");
        //@ts-ignore
        await window.api.ensureBinaries();
        //@ts-ignore
        setList(await window.api.list());
      };
    })();
  }, []);

  return (
    <div className="relative h-screen w-full flex shrink-0">
      {list && <List data={list} />}
      <div className="absolute top-0 right-0 z-100 h-full w-[20dvw] flex shrink-0 flex-col gap-2 justify-end p-3">
        <AnimatePresence>
          {data ? data.map((p) => <PopupItem PL={p} key={JSON.stringify(p)} />) : <div className="opacity-60">Loading status...</div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
