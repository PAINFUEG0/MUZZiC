import { Outlet } from "react-router-dom";
import { treeStore } from "../utils/Store";
import { Popup } from "../components/Popup";
import { useState, useEffect } from "react";
import { flatten } from "../../shared/helpers";
import { MessagePayload } from "../../shared/types/utils";

export function Preload() {
  const [, setTree] = treeStore.use();
  const [progress, setProgress] = useState(0);
  const [task, setTask] = useState<string>("Initializing");
  const [step, setStep] = useState<"INIT" | "DEPS" | "MEDIA" | "READY">("INIT");

  useEffect(() => {
    const run = async () => {
      setStep("INIT");
      await new Promise((r) => setTimeout(r, 1000));
      setProgress(5);

      setStep("DEPS");
      setTask("Checking for dependencies");
      const DLP = await window.api.checkDLP();
      const FFMPEG = await window.api.checkFFMPEG();
      const FFPROBE = await window.api.checkFFPROBE();

      await new Promise((r) => setTimeout(r, 250));
      setProgress(15);

      if (!FFMPEG) {
        setTask("Downloading missing dependency (FFMPEG)");
        await window.api.downloadFFMPEG();
      }
      setProgress(25);

      if (!FFPROBE) {
        setTask("Downloading missing dependency (FFPROBE)");
        await window.api.downloadFFPROBE();
      }
      setProgress(35);

      if (!DLP) {
        setTask("Downloading missing dependency (DLP)");
        await window.api.downloadDLP();
      }
      setProgress(50);

      setStep("MEDIA");
      setTask("Media folder validation");
      await new Promise((r) => setTimeout(r, 150));
      let mediaFolder = await window.api.getMediaFolder();

      if (!mediaFolder) {
        setTask("Setting media folder");
        while (!mediaFolder) mediaFolder = await window.api.openFolderDialog();
        await window.api.setMediaFolder(mediaFolder);
      }
      setProgress(60);

      setTask("Fetching media file tree");

      await new Promise((r) => setTimeout(r, 500));
      const current = await window.api.scan(mediaFolder);
      const previous = await window.api.getTree("mediaFolder");

      setTree(current);

      if (JSON.stringify(previous) !== JSON.stringify(current)) {
        await window.api.setTree("mediaFolder", current);

        const _current = flatten(current);
        const _previous = previous ? flatten(previous) : [];
        const currentMap = new Map(_current.map((x) => [x.id, x]));
        const previousMap = new Map(_previous.map((x) => [x.id, x]));
        const added = _current.filter(({ id }) => !previousMap.has(id));
        const deleted = _previous.filter(({ id }) => !currentMap.has(id));

        if (added.length) {
          const port = await window.api.getPort();
          const ws = new WebSocket(`http://localhost:${port}/ws`);

          ws.onmessage = (m) => {
            const data = JSON.parse(m.data) as MessagePayload;

            if (data.type !== "PROGRESS" || data.data !== "PROBE") return;
            setTask("Extracting metadata [ " + data.current + "/" + data.total + " ]");
          };

          await new Promise((r) => (ws.onopen = r));

          console.time("Extracting metadata");
          const res = await window.api.extractMetadata(added);
          await window.api.setMeta(res.map((e) => ({ key: e.id, value: e })));
          console.timeEnd("Extracting metadata");
          ws.close();
        }

        if (deleted.length) {
          await window.api.deleteMeta(deleted.map((e) => e.id));
        }
      }
      setProgress(80);

      let i = 60;
      setTask("Optimizing everything");

      while (i < 100) {
        setProgress(i);
        i += Math.floor(Math.random() * 16) + 5;
        await new Promise((r) => setTimeout(r, 100));
      }

      setProgress(100);
      await new Promise((r) => setTimeout(r, 250));

      setStep("READY");
    };

    run();
  }, []);

  if (step === "READY") return <Outlet />;

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
