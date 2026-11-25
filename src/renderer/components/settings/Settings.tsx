/** @format */

import { NodeForm } from "./NodeForm";
import { memo, useRef, useState } from "react";
import { ReIndexModal } from "./ReIndexModal";
import { ThemeSelector } from "./ThemeSelector";
import { LavalinkSettings } from "./LavalinkSettings";
import { useBlurMask } from "../../hooks/useBlurMask";
import { PcmDepthSelector } from "./PcmDepthSelector";
import { DirectoryActions } from "./DirectoryActions";
import { themes, themeStore } from "../../stores/theme";
import { needsRestart, pcmFormatStore, treeStore } from "../../stores";

export const Settings = memo(() => {
  const ref = useRef<HTMLDivElement>(null);

  const [tree] = treeStore.use();
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
    <div className="flex h-[85dvh] w-[90dvw] flex-col gap-1">
      <div className="text-xl font-bold">Settings & Configuration</div>
      <div className="mt-1 text-[11px] opacity-50">Customize your application settings and preferences. Don't forget to save your changes ( whenever applicable ) before leaving</div>
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

          <LavalinkSettings setShowNodeForm={setShowNodeForm} />
        </div>
      </div>

      <div className="flex w-full flex-row items-center justify-end gap-2 px-2">
        {(theme !== _theme || mediaFolder !== _mediaFolder || pcmFormat !== _pcmFormat) && (
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
        )}

        {(theme !== _theme || mediaFolder !== _mediaFolder || pcmFormat !== _pcmFormat) && (
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
        )}
      </div>

      <NodeForm showNodeForm={showNodeForm} setShowNodeForm={setShowNodeForm} />
      <ReIndexModal showReIndexModal={showReIndexModal} setShowReIndexModal={setShowReIndexModal} />
    </div>
  );
});
