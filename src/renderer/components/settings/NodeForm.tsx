/** @format */

import { memo, useState } from "react";
import { Modal } from "../utils/Modal";

export const NodeForm = memo(({ showNodeForm, setShowNodeForm }: { showNodeForm: boolean; setShowNodeForm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [secure, setSecure] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <Modal open={showNodeForm} setOpen={setShowNodeForm} className="z-100 max-h-fit w-md border-2 border-(--border-color)/20 bg-(--hover-color)/45 text-(--text-color)">
      <div className="flex w-full flex-col gap-3">
        <div className="mb-3 text-base font-medium">Lavalink node configuration</div>

        <div className="-mt-3 text-[10px] opacity-70">PCM bit depth used for decoding. Higher bit depths consume more memory.</div>
        <div className="-mt-2 text-[10px] opacity-70">This will provide no benefit unless your source audio is already 24-bit / 32-bit.</div>

        <div className="mt-1 flex w-full flex-row gap-3">
          <input
            id="Host"
            type="text"
            value={host}
            spellCheck={false}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Hostname ( without http:// or https:// )"
            className="flex h-fit w-[80%] flex-row items-center rounded-md bg-gray-300/10 px-2 py-1.25 text-sm focus:outline-0"
          />

          <input
            id="Port"
            type="text"
            value={port}
            spellCheck={false}
            placeholder="Port"
            onChange={(e) => setPort(e.target.value)}
            className="flex h-fit w-[20%] flex-row items-center rounded-md bg-gray-300/10 px-2 py-1.25 text-sm focus:outline-0"
          />
        </div>

        <div className="flex w-full flex-row gap-3">
          <input
            type="text"
            id="Password"
            value={password}
            spellCheck={false}
            placeholder="Password"
            onChange={(e) => setHost(e.target.value)}
            className="flex h-fit w-full flex-row items-center rounded-md bg-gray-300/10 px-2 py-1.25 text-sm focus:outline-0"
          />
          <label htmlFor="secure" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input id="secure" type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} className="sr-only" />

            <span className={`relative h-5 w-9 rounded-full transition-colors ${secure ? "bg-green-500" : "bg-red-500"}`}>
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${secure ? "translate-x-4" : "translate-x-0"}`} />
            </span>
            <span>Secure</span>
          </label>
        </div>

        <div className="mt-2 flex flex-row gap-4 text-xs font-semibold">
          <button
            children="Cancel operation"
            onClick={() => setShowNodeForm(false)}
            className="w-full cursor-pointer rounded-md border-2 border-[#ff1116] bg-[#ff111622] pt-1 pb-1.5 text-[#ff3333] transition-all duration-150 active:scale-98"
          />
          <button
            children="Verify and add node"
            onClick={async () => await window.api.addNode({} as any)}
            className="w-full cursor-pointer rounded-md border-2 border-[#31aa16] bg-[#31aa1622] pt-1 pb-1.5 text-[#31ee16] transition-all duration-150 active:scale-98"
          />
        </div>
      </div>
    </Modal>
  );
});
