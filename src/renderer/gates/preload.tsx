import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export function Preload() {
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
      const mediaFolder = await window.api.getMediaFolder();

      if (!mediaFolder) {
        setTask("Setting media folder");
        let selected;

        while (!selected) {
          selected = await window.api.openFolderDialog();
          console.log(selected);
        }

        if (selected) await window.api.setMediaFolder(selected);
      }
      setProgress(60);

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
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 -mt-10">
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

      {/* <Modal setOpen={setShowSelectionModal} open={showSelectionModal} onClose={() => setMediaFolder(null)}>
        <input></input>
      </Modal> */}
    </div>
  );
}
