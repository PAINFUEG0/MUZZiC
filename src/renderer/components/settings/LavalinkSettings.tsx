/** @format */

import { memo, useState } from "react";
import { nodeStore } from "../../stores";
import { MessagePayload } from "../../../shared/types";
import { LuRotateCcw, LuPlus, LuTrash2, LuCheck, LuX, LuFlameKindling } from "react-icons/lu";

export const LavalinkSettings = memo(({ setShowNodeForm }: { setShowNodeForm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [nodes, setNodes] = nodeStore.use();
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [usePublicNodes, setUsePublicNodes] = useState(JSON.parse(localStorage.getItem("usePublicNodes") || "true"));

  return (
    <>
      <div className="col-span-3 flex flex-col gap-2">
        <div className="flex flex-row items-center gap-1 text-sm font-medium">
          <LuFlameKindling className="text-base text-(--accent-color)" />
          Lavalink Configuration
        </div>

        <div className="text-[10px] opacity-70">Manage the Lavalink servers used by the application to handle track searches and audio stream retrieval.</div>
        <div className="-mt-1 text-[10px] opacity-70">
          Refresh to discover available nodes and validate existing connections, or add your own node by providing its connection details and credentials.
        </div>
      </div>

      <div className="col-span-2 flex flex-row items-end justify-end gap-2">
        <button
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            const port = await window.api.getPort();
            const ws = new WebSocket(`ws://localhost:${port}/ws`);
            await new Promise((r) => (ws.onopen = r));

            ws.onmessage = (m: MessageEvent) => {
              const data = JSON.parse(m.data) as MessagePayload;
              if (data.type !== "MESSAGE") return;
              setMessage(data.data);
            };

            const lavalinkNodes = await window.api.fetchLavalinkNodes(usePublicNodes);
            setNodes(lavalinkNodes);
            setRefreshing(false);
            ws.onmessage = null;
          }}
          children={[<LuRotateCcw className="text-sm" />, "Refresh"]}
          className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/20 bg-black/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-95 disabled:opacity-50"
        />

        <button
          disabled={refreshing}
          onClick={() => setShowNodeForm(true)}
          children={[<LuPlus className="text-sm" />, "Add Node"]}
          className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/20 bg-black/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-95 disabled:opacity-50"
        />

        <button
          disabled={refreshing}
          onClick={() => (setUsePublicNodes(!usePublicNodes), localStorage.setItem("usePublicNodes", JSON.stringify(!usePublicNodes)))}
          children={[usePublicNodes ? <LuCheck className="mt-0.5 text-sm" /> : <LuX className="mt-0.5 text-sm" />, "Use public nodes"]}
          className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/20 bg-black/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-95 disabled:opacity-50"
        />
      </div>

      <table className="col-span-full w-full border-2 border-(--border-color)/20 text-center text-xs">
        <thead>
          <tr className="border-2 border-(--border-color)/20">
            <th className="border-2 border-(--border-color)/20 px-2 py-1"></th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1">Host</th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1">Port</th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1">Secure</th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1">Password</th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1">Type</th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1">Download speed</th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1">Response time</th>
            <th className="border-2 border-(--border-color)/20 px-2 py-1"></th>
          </tr>
        </thead>

        {refreshing && (
          <tr className="border-2 border-(--border-color)/20">
            <td colSpan={9} className="border-2 border-(--border-color)/20 px-2 py-3">
              <div className="text-sm leading-relaxed font-medium">Checking for available nodes and re-validating current ones</div>
              <div className="mt-1 text-[11px] leading-relaxed opacity-50">{message}</div>
            </td>
          </tr>
        )}

        {!refreshing && !nodes.length && (
          <tr className="border-2 border-(--border-color)/20">
            <td colSpan={9} className="border-2 border-(--border-color)/20 px-2 py-3">
              <div className="text-sm leading-relaxed font-medium">No compatible nodes avaliable at the moment</div>
              <div className="mt-1 text-[11px] leading-relaxed opacity-50">To add a custom one use the button above or click the refresh button to check for avaliable public nodes </div>
            </td>
          </tr>
        )}

        {!refreshing &&
          nodes
            .map((n: any) => ({
              host: n.host,
              port: n.port,
              type: n.type,
              password: n.password,
              secure: n.secure ? "true" : "false",
              downloadSpeed: n.downloadSpeed + " kb/s",
              resolutionTime: Math.round(n.resolutionTime * 1000) + " ms",
            }))
            .map((node, i) => (
              <tr className="border-2 border-(--border-color)/20">
                <td className="border-2 border-(--border-color)/20 px-2">{i + 1}</td>
                <td className="border-2 border-(--border-color)/20 px-2 py-1">{node.host}</td>
                <td className="border-2 border-(--border-color)/20 px-2 py-1">{node.port}</td>
                <td className="border-2 border-(--border-color)/20 px-2 py-1">{node.secure}</td>
                <td className="border-2 border-(--border-color)/20 px-2 py-1 blur-[2px] transition-all hover:blur-none">{node.password}</td>
                <td className="border-2 border-(--border-color)/20 px-2 py-1">{node.type}</td>
                <td className="border-2 border-(--border-color)/20 px-2 py-1">{node.downloadSpeed}</td>
                <td className="border-2 border-(--border-color)/20 px-2 py-1">{node.resolutionTime}</td>

                <td className="border-2 border-(--border-color)/20 px-2">
                  <div className="flex h-full w-full items-center justify-center">
                    <LuTrash2 className="cursor-pointer active:scale-90" onClick={async () => setNodes(await window.api.removeNode(`${node.host}:${node.port}`))} />
                  </div>
                </td>
              </tr>
            ))}
      </table>
    </>
  );
});
