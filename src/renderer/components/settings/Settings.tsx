/** @format */

import { NodeForm } from "./NodeForm";
import { useRef, useState } from "react";
import { ReIndexModal } from "./ReIndexModal";
import { ThemeSelector } from "./ThemeSelector";
import { PiWaveformBold } from "react-icons/pi";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { useBlurMask } from "../../hooks/useBlurMask";
import { PcmDepthSelector } from "./PcmDepthSelector";
import { DirectoryActions } from "./DirectoryActions";
import { themes, themeStore } from "../../stores/theme";
import { needsRestart, nodeStore, pcmFormatStore, treeStore } from "../../stores";

export function Settings() {
  const ref = useRef<HTMLDivElement>(null);

  const [tree] = treeStore.use();
  const [nodes, setNodes] = nodeStore.use();
  const [theme, setTheme] = themeStore.use();
  const [, setRestartRequired] = needsRestart.use();
  const [pcmFormat, setPcmFormat] = pcmFormatStore.use();
  const [mediaFolder, setMediaFolder] = useState(tree.path);

  const [_theme, _setTheme] = useState(theme);
  const [_pcmFormat, _setPcmFormat] = useState(pcmFormat);
  const [_mediaFolder, _setMediaFolder] = useState(mediaFolder);

  const [showNodeForm, setShowNodeForm] = useState(false);
  const [showReIndexModal, setShowReIndexModal] = useState(false);

  useBlurMask(ref);

  return (
    <div className="flex h-[85dvh] w-[85dvw] flex-col gap-1">
      <div className="text-3xl font-bold">Settings</div>
      <div className="mt-1 text-[11px] opacity-50">Please remember to save the settings using the button below</div>

      <div ref={ref} className="flex h-full w-full scrollbar-none flex-col gap-1 overflow-y-auto">
        <div className="grid h-fit grid-cols-5 gap-5 p-3">
          <div className="col-span-2 flex h-full w-full flex-col gap-2">
            <div className="col-span-2 flex aspect-video h-full w-full rounded-md border-2 border-(--border-color)/40 p-1">
              <img className="aspect-video h-full w-full rounded-sm object-cover" src={_theme.background} />
            </div>
          </div>

          <div className="col-span-3 flex flex-col justify-between gap-2">
            <PcmDepthSelector pcmFormat={_pcmFormat} setPcmFormat={_setPcmFormat} />
            <DirectoryActions mediaFolder={_mediaFolder} setMediaFolder={_setMediaFolder} setShowReIndexModal={setShowReIndexModal} />
            <ThemeSelector theme={_theme} setTheme={_setTheme} />
          </div>

          <div className="col-span-full flex flex-col gap-2">
            <div className="flex flex-row items-center gap-1 text-sm font-medium">
              <PiWaveformBold className="text-base text-(--accent-color)" />
              PCM output format
            </div>
            <div className="text-[10px] opacity-70">PCM bit depth used for decoding. Higher bit depths consume more memory and processing time.</div>
            <div className="-mt-1 text-[10px] opacity-70">This will provide no benefit unless your source audio is already 24-bit / 32-bit.</div>

            <div className="mt-1 grid w-full grid-cols-5 gap-2">
              {nodes.map((n) => (
                <div className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md border-2 border-(--border-color)/20 p-1 pb-1.5 text-xs text-(--accent-color) transition-all active:scale-96">
                  {n.type !== "fetched" && (
                    <div
                      children={<LuTrash2 />}
                      className="absolute inset-0 z-5 flex h-full w-full items-center justify-center bg-red-700/30 text-sm opacity-0 group-hover:opacity-100"
                      onClick={() => window.api.removeNode(`${n.host}:${n.port}`).then(() => setNodes((_) => [..._.filter((__) => `${n.host}:${n.port}` !== `${__.host}:${__.port}`)]))}
                    />
                  )}
                  <div
                    className={"w-full min-w-0 flex-1 truncate px-2 text-center " + (n.type !== "fetched" ? " group-hover:opacity-15" : "")}
                    children={`http${(n?.secure && "s") || ""}://${n.host}:${n.port}`}
                  />
                </div>
              ))}

              {new Array((5 - (nodes.length % 5)) % 5 || 5).fill(null).map(() => (
                <button
                  onClick={() => setShowNodeForm(true)}
                  children={[<LuPlus className="text-sm" />, "Add Lavalink Node"]}
                  className="flex h-full w-full cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/20 bg-black/10 px-2 pt-0.5 pb-1 text-xs text-nowrap transition-all duration-100 active:scale-95"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-row items-center justify-end gap-2 px-2">
        <button
          onClick={() => {
            _setMediaFolder(mediaFolder);
            _setPcmFormat(pcmFormat);
            _setTheme(theme);
          }}
          className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-[#fd1e007e] bg-[#fd1e0031] px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 active:scale-95"
        >
          Discard Changes
        </button>

        <button
          onClick={async (e: any) => {
            localStorage.setItem("theme", themes.findIndex((t) => t.name === _theme.name).toString());
            if (mediaFolder !== _mediaFolder) setRestartRequired(true);
            await window.api.setMediaFolder(_mediaFolder);
            await window.api.setPcmFormat(_pcmFormat);
            setMediaFolder(_mediaFolder);
            setPcmFormat(_pcmFormat);

            if (theme.name === _theme.name) return;
            await new Promise((resolve) => setTimeout(resolve, 50));
            const [x, y, w, h] = [e.clientX, e.clientY, window.innerWidth, window.innerHeight];
            const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

            await document
              .startViewTransition(() => setTheme(_theme))
              .ready.then(() =>
                document.documentElement.animate(
                  { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
                  { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
                ),
              );
          }}
          className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-[#00ff4088] bg-[#00ff402f] px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 active:scale-95"
        >
          Save changes
        </button>
      </div>

      <NodeForm showNodeForm={showNodeForm} setShowNodeForm={setShowNodeForm} />
      <ReIndexModal showReIndexModal={showReIndexModal} setShowReIndexModal={setShowReIndexModal} />
    </div>
  );
}
