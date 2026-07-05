/** @format */

import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { flatten, sleep } from "../../shared/helpers";
import { themeStore, treeStore } from "../utils/globalStores";
import { API, DirNode, MessagePayload, Track, Tree } from "../../shared/types";

export function Preload() {
  const [theme] = themeStore.use();
  const [, setTree] = treeStore.use();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [task, setTask] = useState<string>("Initializing");
  const [footer, setFooter] = useState<string | null>(null);

  document.documentElement.style.setProperty("--accent-color", theme.color);
  document.documentElement.style.setProperty("--text-color", theme.type === "dark" ? "#ffffff" : "#000000");
  document.documentElement.style.setProperty("--hover-color", theme.type === "dark" ? "#000000" : "#ffffff");
  document.documentElement.style.setProperty("--border-color", theme.type === "dark" ? "#ffffff" : "#000000");

  useEffect(() => {
    const run = async () => {
      window.api = new Proxy({} as API, {
        get(_, K) {
          return (...args: any[]) => window.invoke(String(K), ...args);
        },
      });

      setTask("Preparing connections & dependencies");

      const port = await window.api.getPort();
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      await new Promise((r) => (ws.onopen = r));

      const downloadProgress = (p: number, b: string) => (m: MessageEvent) => {
        const data = JSON.parse(m.data) as MessagePayload;
        if (data.type !== "PROGRESS") return;
        setProgress(p + (data.current / data.total) * 5);
        setFooter(`Downloading ${b} - ${(data.current / 1024 / 1024).toFixed(2)} MB / ${(data.total / 1024 / 1024).toFixed(2)} MB`);
      };

      setTask("Checking for dependencies");

      setFooter("1/3 - YT-DLP");
      const DLP = await window.api.checkDLP();
      setProgress(5);

      setFooter("2/3 - FFMPEG");
      const FFMPEG = await window.api.checkFFMPEG();
      setProgress(10);

      setFooter("3/3 - FFPROBE");
      const FFPROBE = await window.api.checkFFPROBE();
      setProgress(15);

      (!DLP || !FFMPEG || !FFPROBE) && setTask("Downloading missing dependencies");

      ws.onmessage = downloadProgress(15, "YT-DLP");
      !DLP && (await window.api.downloadDLP());
      setProgress(20);

      ws.onmessage = downloadProgress(20, "FFMPEG");
      !FFMPEG && (await window.api.downloadFFMPEG());
      setProgress(25);

      ws.onmessage = downloadProgress(25, "FFPROBE");
      !FFPROBE && (await window.api.downloadFFPROBE());
      setProgress(30);

      ws.onmessage = null;
      setFooter("");

      setTask("Checking for media folder");
      let mediaFolder = await window.api.getMediaFolder();
      !mediaFolder && setTask("Media folder not set! Please select a folder");
      while (!mediaFolder) mediaFolder = await window.api.openFolderDialog();
      await window.api.setMediaFolder(mediaFolder);
      setProgress(40);

      setTask("Preparing library");

      setFooter("Scanning");
      const currentTree = await window.api.scan(mediaFolder);
      const previousTree = await window.api.getTree("mediaFolder");
      await window.api.setTree("mediaFolder", currentTree);
      await sleep(150);
      setProgress(50);

      setFooter("Checking for changes");
      if (JSON.stringify(previousTree) !== JSON.stringify(currentTree)) {
        const _current = flatten(currentTree);
        const _previous = previousTree ? flatten(previousTree) : [];
        const currentMap = new Map(_current.map((x) => [x.id, x]));
        const previousMap = new Map(_previous.map((x) => [x.id, x]));
        const added = _current.filter(({ id }) => !previousMap.has(id));
        const deleted = _previous.filter(({ id }) => !currentMap.has(id));

        if (added.length) {
          ws.onmessage = (m: MessageEvent) => {
            const data = JSON.parse(m.data) as MessagePayload;
            if (data.type !== "PROGRESS" || data.data !== "PROBE") return;
            setTask("Extracting metadata and thumbnails");
            setFooter(`Processed ${data.current} / ${data.total} files`);
            setProgress(Math.floor(30 * (data.current / data.total)) + 50);
          };

          const res = await window.api.extractMetadata(added);

          setTask(`Saving index for ${added.length} newly added files`);
          await window.api.setMeta(res);
          ws.onmessage = null;
          setProgress(deleted.length ? 85 : 90);
        }

        if (deleted.length) {
          setTask(`Removing index for ${deleted.length} deleted files`);
          await window.api.deleteMeta(deleted.map((e) => e.id));
          setProgress(90);
        }
      }

      const flat = flatten(currentTree);

      const metas = Object.fromEntries(
        ((await window.api.getMeta(flat.map((e) => e.id))).filter(Boolean) as Track[]).map((e) => [e!.id, e]),
      );

      const populateTreeWithMeta = (node: DirNode) => {
        for (let i = 0; i < node.files.length; i++)
          (node.files[i] as any) = {
            ...node.files[i],
            ...metas[node.files[i]!.id]!,
            thumb: `http://localhost:${port}/thumb/${node.files[i]!.id}`,
          } satisfies Track;

        node.dirs.forEach((e) => populateTreeWithMeta(e));

        return node as unknown as Tree;
      };

      setTree(populateTreeWithMeta(currentTree));
      setTask("All done!");
      setProgress(100);
      await sleep(300);
      setReady(true);
      ws.close();
    };

    run();
  }, []);

  return (
    <div className="relative flex h-screen w-full shrink-0 flex-col overflow-hidden p-1.5 text-(--text-color)">
      <img
        src={theme.backgrground}
        style={{ filter: `blur(${theme.blur})` }}
        className="absolute inset-0 -z-50 h-full w-full scale-110 object-cover"
      />

      <div className="absolute inset-0 -z-40 h-full w-full bg-white" style={{ opacity: theme.tint.white.overall }} />
      <div className="absolute inset-0 -z-30 h-full w-full bg-black" style={{ opacity: theme.tint.black.overall }} />

      <div className="absolute inset-0 h-7 w-full cursor-pointer" style={{ WebkitAppRegion: "drag" } as any} />

      {ready ? (
        <Outlet />
      ) : (
        <div className="relative flex h-full w-full shrink-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-(--border-color)/20 shadow-sm">
          <div className="absolute inset-0 -z-30 h-full w-full bg-(--hover-color)/20 backdrop-blur-lg" />

          <div
            style={{
              width: 150,
              height: 120,
              backgroundColor: "var(--accent-color)",
              mask: "url('./logo.png') center / contain no-repeat",
              WebkitMask: "url('./logo.png') center / contain no-repeat",
            }}
          />

          <div className="-mt-3 text-center text-xs font-medium text-nowrap" children={task} />

          <div className="flex h-1 w-[25dvw] shrink-0 rounded-full bg-(--accent-color)/50">
            <div className="rounded-full bg-(--accent-color)/80" style={{ width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>

          <div className="-mt-1.5 flex w-[22dvw] justify-end text-[10px] opacity-40" children={footer || "\u00A0"} />
        </div>
      )}
    </div>
  );
}
