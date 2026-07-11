/** @format */

import { themes } from "../utils/themes";
import { useEffect, useState } from "react";
import { flatten } from "../../shared/helpers";
import { needsRestart, pcmFormatStore, themeStore, treeStore } from "../utils/globalStores";

export function Settings() {
  const [tree] = treeStore.use();
  const [rs, setRs] = needsRestart.use();
  const [currentTheme, setTheme] = themeStore.use();
  const [pcmFormat, setPcmFormat] = pcmFormatStore.use();
  const [mediaFolder, setMediaFolder] = useState(localStorage.getItem("mediaFolder") || tree.path);

  useEffect(() => void window.api.setPcmFormat(pcmFormat), [pcmFormat]);

  return (
    <div className="flex h-[85dvh] w-[85dvw] flex-col gap-1">
      <div className="text-3xl font-bold">Settings</div>
      <div className="text-[11px] opacity-50">Please remember to save the settings using the button below</div>

      <div className="flex h-full w-full scrollbar-none flex-col gap-1 overflow-y-auto">
        <div className="pt-3 pb-1 text-sm font-medium">Select color theme</div>

        <div className="grid grid-cols-5 gap-5 p-3">
          {themes.map((theme, i) => (
            <button
              key={i}
              children={[<img className="h-fit w-full rounded-sm" src={theme.preview} />, <div>{theme.name.toUpperCase()}</div>]}
              className={
                "flex h-fit w-full shrink-0 cursor-pointer flex-col rounded-md border-2 p-1 text-[10px] font-bold transition-all duration-150 hover:scale-105 active:scale-95 " +
                (JSON.stringify(theme) === JSON.stringify(currentTheme)
                  ? "border-(--accent-color)/45 bg-(--accent-color)/8"
                  : "border-(--border-color)/20")
              }
              onClick={(e) => {
                if (JSON.stringify(theme) === JSON.stringify(currentTheme)) return;

                const x = e.clientX;
                const y = e.clientY;
                const w = window.innerWidth;
                const h = window.innerHeight;
                const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

                const switchTheme = () => {
                  setTheme(theme);
                  localStorage.setItem("theme", i.toString());
                  document.documentElement.style.setProperty("--accent-color", theme.accent);
                  document.documentElement.style.setProperty("--text-color", theme.type === "dark" ? "#ffffff" : "#000000");
                  document.documentElement.style.setProperty("--hover-color", theme.type === "dark" ? "#000000" : "#ffffff");
                  document.documentElement.style.setProperty("--border-color", theme.type === "dark" ? "#ffffff" : "#000000");
                };

                return document
                  .startViewTransition(switchTheme)
                  .ready.then(() =>
                    document.documentElement.animate(
                      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
                      { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
                    ),
                  );
              }}
            />
          ))}
        </div>

        <div className="flex flex-row items-center gap-1 pt-3 pb-1">
          <div className="text-sm font-medium">Directory and Indexing</div>
          <div className="text-xs opacity-70">( Changes will take effect after restarting the app )</div>
        </div>

        <div className="flex h-fit w-full flex-col gap-2 p-3">
          <div className="flex flex-row items-center gap-1">
            <div className="font-medium">Media folder :</div>
            <div className="pt-0.5 text-sm opacity-70">{mediaFolder}</div>
          </div>

          <div className="flex flex-row items-center gap-2">
            {[
              {
                label: "Change media folder",
                onClick: async () => {
                  const newMediaFolder = await window.api.openFolderDialog();
                  if (!newMediaFolder || newMediaFolder === mediaFolder) return;
                  localStorage.setItem("mediaFolder", newMediaFolder);
                  await window.api.setMediaFolder(newMediaFolder);
                  setMediaFolder(newMediaFolder);
                  !rs && setRs(true);
                },
              },
              {
                label: "Re-index library",
                onClick: async () => {
                  await window.api.deleteMeta(flatten(tree).map(({ id }) => id));
                  await window.api.deleteTree("mediaFolder");
                  !rs && setRs(true);
                },
              },
              { label: "Reinstall binaries", onClick: () => {} },
              { label: "Update binaries", onClick: () => {} },
              { label: "Check for updates", onClick: () => {} },
            ].map(({ label, onClick }) => (
              <button
                key={label}
                children={label}
                onClick={onClick}
                className="flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 border-(--border-color)/15 bg-(--border-color)/10 px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 hover:scale-105 active:scale-95"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-row items-center gap-1 pt-3 pb-1">
          <div className="text-sm font-medium">PCM output format</div>
          <div className="text-[11px] opacity-70">
            ( PCM bit depth used for decoding. Higher bit depths consume more memory and processing time, and generally provide no benefit
            unless your source audio is already 24/32-bit )
          </div>
        </div>

        <div className="flex h-fit w-full flex-row gap-2 p-3">
          {[
            { id: "pcm_s16le", label: "16-bit PCM ( s16le )", onClick: () => setPcmFormat("pcm_s16le") },
            { id: "pcm_s24le", label: "24-bit PCM ( s24le )", onClick: () => setPcmFormat("pcm_s24le") },
            { id: "pcm_s32le", label: "32-bit PCM ( s32le )", onClick: () => setPcmFormat("pcm_s32le") },
          ].map(({ id, label, onClick }) => (
            <button
              key={id}
              children={label}
              onClick={onClick}
              className={
                "flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 hover:scale-105 active:scale-95 " +
                (id === pcmFormat
                  ? " border-(--accent-color)/45 bg-(--accent-color)/8"
                  : "border-(--border-color)/15 bg-(--border-color)/10")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
