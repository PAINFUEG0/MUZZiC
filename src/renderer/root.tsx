import { useEffect, useState } from "react";

import type { Message } from "../shared/types/utils";

export function Root() {
  const [data, setData] = useState<Message | null>(null);

  useEffect(() => {
    (async () => {
      //@ts-ignore
      const port = await window.api.getPort();

      console.log(`Connecting: http://localhost:${port}/ws`);
      const ws = new WebSocket(`http://localhost:${port}/ws`);

      ws.onmessage = (e) => {
        const message = JSON.parse(e.data) as Message;
        setData(message);
      };

      ws.onopen = async () => {
        console.log("Connected !!! Requesting binary validation");
        //@ts-ignore
        await window.api.ensureBinaries();
      };
    })();
  }, []);

  return (
    <div className="px-3 py-2 bg-[#232323] rounded-sm text-sm text-[#eee]">
      <div className="font-medium mb-1">Backend Status</div>
      {data ? (
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div className="opacity-60">Loading status...</div>
      )}
    </div>
  );
}
