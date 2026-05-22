import "./index.css";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Track } from "../shared/types/sourcePlugin";
import { FaBackward, FaCompactDisc, FaMusic, FaPlay, FaSearch } from "react-icons/fa";

function Hello() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      //@ts-ignore
      await window.api.ensureBinaries();
      //@ts-ignore
      setData(await window.api.list());
      console.log(data);
    })();
  }, []);

  return (
    <div className="flex flex-col p-5 bg-[#1f1f1f] h-screen overflow-hidden gap-5">
      <div className="flex gap-3 flex-row px-5 border-[#4a4a4a] bg-[#303030] border rounded-sm items-center py-2 text-[#F0F0F0] opacity-60 ">
        <FaSearch />
        <div className="font-medium">Search songs . . . </div>
      </div>

      <div className="flex flex-row p-3 border-[#4a4a4a] bg-[#262626] border rounded-sm items-center gap-2">
        <div className="flex items-center justify-center h-15 w-15 border-[#4a4a4a] bg-[#4a4a4a55] border rounded-sm shrink-0">
          <FaCompactDisc className="text-[#f5f5f5aa] text-2xl" />
        </div>

        <div className="flex items-center justify-end  h-15 w-full  border-[#4a4a4a] bg-[#4a4a4a55] border rounded-sm"></div>

        <div className="flex items-center justify-end h-15 rounded-sm gap-2">
          <button className="flex items-center justify-center h-full aspect-square border-[#4a4a4a] bg-[#4a4a4a55] border rounded-sm">
            <FaBackward className="text-[#f5f5f5aa] text-2xl" />
          </button>
          <button className="flex items-center justify-center h-full aspect-square border-[#4a4a4a] bg-[#4a4a4a55] border rounded-sm">
            <FaPlay className="text-[#f5f5f5aa] text-2xl" />
          </button>
          <button className="flex items-center justify-center h-full aspect-square border-[#4a4a4a] bg-[#4a4a4a55] border rounded-sm">
            <FaBackward className="text-[#f5f5f5aa] text-2xl -scale-x-100" />
          </button>
        </div>
      </div>

      <div className="flex flex-col bg-[#1f1f1f] h-screen overflow-auto gap-1 scrollbar-none">
        {data?.map((t: Track<true>, i: number) => {
          return (
            <div
              key={t.id}
              onClick={() => console.log(t.streamURI)}
              className="flex flex-row items-center h-fit gap-4 text-[#f5f5f5] cursor-pointer hover:bg-[#3c3c3c33] rounded-sm px-3 py-2"
            >
              <div className="text-[#4a4a4a] w-3">{i + 1}</div>

              <div className="flex items-center justify-center gap-2 h-8 w-8 bg-[#262626] rounded-md border-[#4a4a4a]">
                <FaMusic />
              </div>

              <div className="flex flex-col w-fit ">
                <div className="flex flex-row items-center gap-5">
                  <div className="text-sm font-bold">{t.title}</div>
                  <div className="flex flex-row py-px px-1  h-fit w-fit text-xs rounded-md bg-[#3c3c3c]">{t.resolution}</div>
                </div>
                <div className="flex flex-row gap-3">
                  <div className="text-xs opacity-70">Artist - {t.artists.map((a) => a.name).join(", ")}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Hello />);
