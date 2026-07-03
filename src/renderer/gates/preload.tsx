/** @format */

import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { flatten } from "../../shared/helpers";
import { themeStore, treeStore } from "../utils//globalStores";
import { API, DirNode, MessagePayload, Track, Tree } from "../../shared/types";

export function Preload() {
  const [theme] = themeStore.use();
  const [, setTree] = treeStore.use();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [task, setTask] = useState<string>("Initializing");

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

      const DLP = await window.api.checkDLP();
      const FFMPEG = await window.api.checkFFMPEG();
      const FFPROBE = await window.api.checkFFPROBE();
      setProgress(5);

      !FFMPEG && setTask("Downloading missing dependency (FFMPEG)");
      !FFMPEG && (await window.api.downloadFFMPEG());
      setProgress(10);

      !FFPROBE && setTask("Downloading missing dependency (FFPROBE)");
      !FFPROBE && (await window.api.downloadFFPROBE());
      setProgress(15);

      !DLP && setTask("Downloading missing dependency (YT-DLP)");
      !DLP && (await window.api.downloadDLP());
      setProgress(20);

      setTask("Checking for media folder");
      let mediaFolder = await window.api.getMediaFolder();
      !mediaFolder && setTask("Media folder not set! Please select a folder");
      while (!mediaFolder) mediaFolder = await window.api.openFolderDialog();
      await window.api.setMediaFolder(mediaFolder);
      setProgress(25);

      setTask("Preparing library (Scanning)");
      const currentTree = await window.api.scan(mediaFolder);
      const previousTree = await window.api.getTree("mediaFolder");
      await window.api.setTree("mediaFolder", currentTree);
      setProgress(35);

      setTask("Preparing library (Checking for changes)");
      if (JSON.stringify(previousTree) !== JSON.stringify(currentTree)) {
        const _current = flatten(currentTree);
        const _previous = previousTree ? flatten(previousTree) : [];
        const currentMap = new Map(_current.map((x) => [x.id, x]));
        const previousMap = new Map(_previous.map((x) => [x.id, x]));
        const added = _current.filter(({ id }) => !previousMap.has(id));
        const deleted = _previous.filter(({ id }) => !currentMap.has(id));

        if (added.length) {
          setTask(`Preparing to extract metadata of ${added.length} newly added files`);

          ws.onmessage = (m: MessageEvent) => {
            const data = JSON.parse(m.data) as MessagePayload;
            if (data.type !== "PROGRESS" || data.data !== "PROBE") return;
            setTask("Extracting metadata [ " + data.current + "/" + data.total + " ]");
            setProgress(Math.floor(60 * (data.current / data.total)) + 35);
          };

          const res = await window.api.extractMetadata(added);
          await window.api.setMeta(res);
          ws.onmessage = null;
          setProgress(95);
        }

        if (deleted.length) {
          setTask(`Removing index for ${deleted.length} deleted files`);
          await window.api.deleteMeta(deleted.map((e) => e.id));
          setProgress(100);
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

          <div className="-mt-3 flex w-[25dvw] shrink-0 flex-row items-center justify-center gap-2 px-3">
            <div className="flex text-xs font-medium">{task}</div>
          </div>

          <div className="flex h-1 w-[25dvw] shrink-0 rounded-full bg-(--accent-color)/50">
            <div className="rounded-full bg-(--accent-color)/80" style={{ width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>
        </div>
      )}
    </div>
  );
}
