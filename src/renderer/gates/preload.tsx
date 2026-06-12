import { Outlet } from "react-router-dom";
import { treeStore } from "../utils/Store";
import { Popup } from "../components/Popup";
import { useState, useEffect } from "react";
import { flatten } from "../../shared/helpers";
import { DirNode, MessagePayload } from "../../shared/types/utils";

export function Preload() {
  const [, setTree] = treeStore.use();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [task, setTask] = useState<string>("Initializing");

  useEffect(() => {
    const run = async () => {
      setTask("Preparing connections & dependencies");

      const port = await window.api.getPort();
      const ws = new WebSocket(`http://localhost:${port}/ws`);
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
            setProgress(Math.floor(30 * (data.current / data.total)) + 35);
          };

          const res = await window.api.extractMetadata(added);
          await window.api.setMeta(res);
          setProgress(65);

          setTask(`Preparing to extract .thumbnails of ${added.length} newly added files`);

          ws.onmessage = (m: MessageEvent) => {
            const data = JSON.parse(m.data) as MessagePayload;
            if (data.type !== "PROGRESS" || data.data !== "THUMB") return;
            setTask("Extracting thumbnail [ " + data.current + "/" + data.total + " ]");
            setProgress(Math.floor(30 * (data.current / data.total)) + 65);
          };

          await window.api.extractThumbnail(added);
          ws.onmessage = null;
          setProgress(95);
        }

        if (deleted.length) {
          setTask(`Removing index for ${deleted.length} deleted files`);
          await window.api.deleteMeta(deleted.map((e) => e.id));
          setProgress(70);
        }
      }

      const flat = flatten(currentTree);
      const metas = Object.fromEntries((await window.api.getMeta(flat.map((e) => e.id))).filter(Boolean).map((e) => [e!.id, e]));

      const populateTreeWithMeta = (node: DirNode<true>) => {
        for (let i = 0; i < node.files.length; i++)
          (node.files[i] as any) = {
            ...node.files[i],
            ...(metas[node.files[i]!.id] || {}),
            thumb: `http://localhost:${port}/thumb/${node.files[i]!.id}`,
          };
        node.dirs.forEach((e) => populateTreeWithMeta(e));
      };

      populateTreeWithMeta(currentTree);
      setTree(currentTree as any);
      setTask("All done!");
      setProgress(100);
      setReady(true);
      ws.close();
    };

    run();
  }, []);

  if (ready) return <Outlet />;

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center gap-3 -mt-10 ">
      <Popup />
      <div
        style={{
          width: 150,
          height: 120,
          backgroundColor: "black",
          mask: "url('./logo.png') center / contain no-repeat",
          WebkitMask: "url('./logo.png') center / contain no-repeat",
        }}
      />

      <div className="flex flex-row items-center w-[25dvw] justify-center px-3 gap-2">
        <div className="flex text-xs font-medium">{task}</div>
      </div>

      <div className="flex h-1 w-[25dvw] rounded-full bg-gray-400">
        <div className="bg-black rounded-full" style={{ width: `${progress}%`, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}
