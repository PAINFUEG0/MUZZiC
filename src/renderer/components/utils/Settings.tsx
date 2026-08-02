/** @format */

import { Modal } from "./Modal";
import { MdWarning } from "react-icons/md";
import { PiWaveformBold } from "react-icons/pi";
import { useMemo, useRef, useState } from "react";
import { LuInfo, LuLibrary } from "react-icons/lu";
import { useBlurMask } from "../../hooks/useBlurMask";
import { themes, themeStore } from "../../stores/theme";
import { chunk, flatten } from "../../../shared/helpers";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { needsRestart, pcmFormatStore, treeStore } from "../../stores";

export function Settings() {
  const ref = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);

  const [tree] = treeStore.use();
  const [theme, setTheme] = themeStore.use();
  const [, setRestartRequired] = needsRestart.use();
  const [pcmFormat, setPcmFormat] = pcmFormatStore.use();
  const [mediaFolder, setMediaFolder] = useState(tree.path);

  const [_theme, _setTheme] = useState(theme);
  const [_pcmFormat, _setPcmFormat] = useState(pcmFormat);
  const [_mediaFolder, _setMediaFolder] = useState(mediaFolder);

  const [index, setIndex] = useState(0);
  const themeChunks = useMemo(() => chunk(themes, 5 * 3), [themes]);

  useBlurMask(ref);

  return (
    <div className="relative flex h-[85dvh] w-[85dvw] flex-col gap-1">
      <div className="text-3xl font-bold">Settings</div>
      <div className="text-[11px] opacity-50">Please remember to save the settings using the button below</div>

      <div ref={ref} className="flex h-full w-full scrollbar-none flex-col gap-1 overflow-y-auto">
        <div className="grid h-fit grid-cols-5 gap-5 p-3">
          <div className="col-span-2 flex h-full w-full flex-col gap-2">
            <div className="col-span-2 flex aspect-video h-full w-full rounded-md border-2 border-(--border-color)/40 p-1">
              <img className="aspect-video h-full w-full rounded-sm object-cover" src={_theme.background} />
            </div>
          </div>

          <div className="col-span-3 flex flex-col gap-2">
            <div className="flex flex-row items-center gap-1 pt-3 pb-1">
              <LuLibrary className="text-(--accent-color)" />
              <div className="text-sm font-medium">Directory and Indexing</div>
              <div className="text-xs opacity-70">( Changes will take effect after restarting the app )</div>
            </div>

            <div className="mb-1 flex scrollbar-none flex-row items-baseline gap-1 overflow-hidden text-sm text-nowrap">
              <div className="text-xs opacity-70">Currently using</div>
              <div className="min-w-0 truncate text-xs font-medium text-(--accent-color)">{_mediaFolder}</div>
              <div className="text-xs opacity-70">as media folder.</div>
            </div>

            <div className="flex flex-row items-center gap-2">
              {[
                {
                  label: "Change media folder",
                  onClick: async () => _setMediaFolder((await window.api.openFolderDialog()) || _mediaFolder),
                },
                { label: "Refresh library ( index changes )", onClick: () => window.navigation.reload() },
                {
                  label: "Rebuild library ( re-index everything )",
                  onClick: async () => {
                    setShow(true);
                  },
                },
              ].map(({ label, onClick }) => (
                <button
                  key={label}
                  children={label}
                  onClick={onClick}
                  className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--border-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 hover:scale-105 active:scale-95"
                />
              ))}
            </div>

            <div className="flex flex-col gap-1 pt-4 pb-1">
              <div className="flex flex-row items-center gap-1 text-sm font-medium">
                <PiWaveformBold className="text-base text-(--accent-color)" />
                PCM output format
              </div>
              <div className="text-[10px] opacity-70">PCM bit depth used for decoding. Higher bit depths consume more memory and processing time.</div>
              <div className="-mt-1 text-[10px] opacity-70">This will provide no benefit unless your source audio is already 24-bit / 32-bit.</div>
            </div>

            <div className="flex h-fit w-full flex-row gap-2 pt-1">
              {[
                { id: "pcm_s16le", label: "16-bit PCM ( s16le )", onClick: () => _setPcmFormat("pcm_s16le") },
                { id: "pcm_s24le", label: "24-bit PCM ( s24le )", onClick: () => _setPcmFormat("pcm_s24le") },
                { id: "pcm_s32le", label: "32-bit PCM ( s32le )", onClick: () => _setPcmFormat("pcm_s32le") },
              ].map(({ id, label, onClick }) => (
                <button
                  key={id}
                  children={label}
                  onClick={onClick}
                  className={
                    "flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 hover:scale-105 active:scale-95 " +
                    (id === _pcmFormat ? " border-(--accent-color)/45 bg-(--accent-color)/8" : "border-(--border-color)/15 bg-(--border-color)/10")
                  }
                />
              ))}
            </div>

            <div className="flex flex-row gap-2 pt-2 text-sm font-medium">Select color theme below :</div>
          </div>

          <div className="col-span-full flex h-full w-full flex-col items-center">
            <div className="flex h-full w-full flex-row">
              <div
                onClick={() => setIndex(index === 0 ? themeChunks.length - 1 : index - 1)}
                className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-(--border-color)/20 p-1 transition-all duration-150 active:scale-90"
              >
                <FaAngleLeft />
              </div>

              <div className="grid h-full w-full grid-cols-5 gap-3 px-3">
                {themeChunks[index]!.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => _setTheme(t)}
                    children={<div>{t.name.toUpperCase()}</div>}
                    className={
                      "flex h-fit w-full cursor-pointer items-center justify-center rounded-md border-2 p-1 text-[10px] font-bold text-nowrap transition-all duration-150 active:scale-95 " +
                      (JSON.stringify(t) === JSON.stringify(_theme) ? "border-(--accent-color)/45 bg-(--accent-color)/8" : "border-(--border-color)/20")
                    }
                  />
                ))}
              </div>

              <div
                onClick={() => setIndex(index === themeChunks.length - 1 ? 0 : index + 1)}
                className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-(--border-color)/20 p-1 transition-all duration-150 active:scale-90"
              >
                <FaAngleRight />
              </div>
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

      <Modal open={show} setOpen={setShow} className="z-100 max-h-fit w-fit border-2 border-(--border-color)/20 bg-(--hover-color)/45 text-(--text-color)">
        <div className="flex flex-col">
          <div className="mb-3 text-xl">Are you sure about that ?</div>

          <div className="flex flex-row items-center gap-1.5 py-2 text-xs">
            <LuInfo className="text-(--accent-color)" />
            <div className="opacity-70">Indexes include metadata, thumbnails, lyrics, etc.</div>
          </div>
          <div className="flex flex-row items-center gap-1.5 text-xs">
            <LuInfo className="text-(--accent-color)" />
            <div className="opacity-70">Re-indexing will delete all indexes and rebuild them from scratch.</div>
          </div>

          <div className="w-md pt-3 align-middle text-xs">
            <MdWarning className="mr-1 mb-1 inline text-sm text-red-500" />
            <div className="inline opacity-70">
              Doing this will take quite a while and is not recommended if you have a large library unless you really know what you're doing or you really need to.
            </div>
          </div>

          <div className="mt-5 flex flex-row gap-4 text-xs font-semibold">
            <button
              onClick={async () => {
                await window.api.deleteMeta(flatten(tree).map(({ id }) => id));
                await window.api.deleteTree("mediaFolder");
                window.navigation.reload();
              }}
              className="w-full cursor-pointer rounded-md border-2 border-[#ff1116] bg-[#ff111622] pt-1 pb-1.5 text-[#ff3333] transition-all duration-150 active:scale-98"
            >
              Rebuild / Re-index library
            </button>
            <button
              onClick={() => setShow(false)}
              className="w-full cursor-pointer rounded-md border-2 border-[#31aa16] bg-[#31aa1622] pt-1 pb-1.5 text-[#31ee16] transition-all duration-150 active:scale-98"
            >
              Cancel operation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
