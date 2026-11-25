/** @format */

import { Modal } from "../utils/Modal";
import { memo, useState } from "react";
import { nodeStore } from "../../stores";
import { Node } from "../../../shared/types";
import { LuInfo } from "react-icons/lu";

export const NodeForm = memo(({ showNodeForm, setShowNodeForm }: { showNodeForm: boolean; setShowNodeForm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [nodes, setNodes] = nodeStore.use();
  const [secure, setSecure] = useState(false);
  const [password, setPassword] = useState("");

  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(false);

  return (
    <Modal open={showNodeForm} setOpen={setShowNodeForm} className="z-100 max-h-fit w-md border-2 border-(--border-color)/20 bg-(--hover-color)/45 text-(--text-color)">
      <div className="flex w-full flex-col gap-3">
        <div className="mb-3 text-base font-medium">Lavalink node configuration</div>

        <div className="-mt-3 text-[11px] opacity-70">
          <LuInfo className="mr-1 mb-px inline shrink-0 text-(--accent-color)" />
          Connect a custom Lavalink server to enable track searching and audio stream retrieval through your own node.Enter the server hostname, port, authentication password, and connection security
          settings
        </div>

        <div className="text-[11px] opacity-70">
          <LuInfo className="mr-1 mb-px inline shrink-0 text-(--accent-color)" />
          The node must have an endpoint <span className="rounded-md bg-gray-200/20 px-1.5 pb-0.5">/youtube/stream/id</span> which returns a stream.
        </div>

        <div className="mt-1 flex w-full flex-row gap-3">
          <input
            id="Host"
            type="text"
            value={host}
            disabled={ok}
            spellCheck={false}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Hostname ( without http:// or https:// )"
            className="flex h-fit w-[80%] flex-row items-center rounded-md bg-gray-300/10 px-2 py-1.25 text-sm focus:outline-0"
          />

          <input
            id="Port"
            type="text"
            value={port}
            disabled={ok}
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
            disabled={ok}
            value={password}
            spellCheck={false}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-fit w-full flex-row items-center rounded-md bg-gray-300/10 px-2 py-1.25 text-sm focus:outline-0"
          />

          <label htmlFor="secure" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input disabled={ok} id="secure" type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} className="sr-only" />
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
            disabled={!host || !port || !password || nodes.findIndex((n) => n.host === host && n.port === Number(port)) !== -1}
            children={checking ? "Checking" : nodes.findIndex((n) => n.host === host && n.port === Number(port)) !== -1 ? "Node already exists" : "Verify and add node"}
            onClick={async () => {
              setChecking(true);
              const node = { host, port: Number(port), password, secure, type: "custom" } as const;
              const res = await window.api.checkNode(node);
              setChecking(false);

              if (!res) return alert("Please check the details you've entered and try again !");

              await window.api.addNode(res);
              setNodes((_) => ([..._, res] as Node<true>[]).sort((a, b) => b.downloadSpeed - a.downloadSpeed));
              setShowNodeForm(false);
              setChecking(false);
              setPassword("");
              setOk(false);
              setHost("");
              setPort("");
            }}
            className="w-full cursor-pointer rounded-md border-2 border-[#31aa16] bg-[#31aa1622] pt-1 pb-1.5 text-[#31ee16] transition-all duration-150 active:scale-98 disabled:opacity-50"
          />
        </div>
      </div>
    </Modal>
  );
});
