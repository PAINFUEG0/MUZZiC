/** @format */

import axios from "axios";
import { TbSearch } from "react-icons/tb";
import { util, cipher } from "node-forge";
import { playerMethods } from "../stores";
import { MdDownloading } from "react-icons/md";
import { memo, useRef, useState } from "react";
import { useBlurMask } from "../hooks/useBlurMask";
import { LuInfo, LuLoaderCircle } from "react-icons/lu";
import { BiAddToQueue, BiDownload } from "react-icons/bi";
import { Track as TrackComponent } from "../components/utils/Track";

import type { Track } from "../../shared/types";

const iv = util.createBuffer("00000000");
const key = util.createBuffer("38346591");
const baseAPI = "https://www.jiosaavn.com/api.php?api_version=4&_format=json&_marker=0&ctx=web6dot0";

function createDownloadLink(encryptedMediaUrl: string) {
  const decipher = cipher.createDecipher("DES-ECB", key);
  decipher.start({ iv });
  decipher.update(util.createBuffer(atob(encryptedMediaUrl)));
  decipher.finish();

  return decipher.output.getBytes().replace("_96", "_320");
}

async function fetchChunks(url: string) {
  const perChunk = 30;
  const maxCount = 300;
  const { data } = await axios(url + "&n=" + maxCount);
  const chunksCount = Math.ceil(Math.min(data.total, maxCount) / perChunk);
  return await Promise.all(Array.from({ length: chunksCount }, (_, i) => axios(`${url}&n=${perChunk}&p=${i + 1}`).catch(() => ({ data: { results: [] } }))));
}

async function searchTracks(query: string) {
  return (await fetchChunks(`${baseAPI}&__call=search.getResults&q=${query}`))
    .flatMap((r) => r.data.results)
    .map(
      (track) =>
        ({
          channels: 2,
          id: track.id,
          codec: "aac",
          layout: "stereo",
          name: track.title,
          title: track.title,
          lyrics: "No lyrics found",
          album: track.more_info.album,
          duration: track.more_info.duration,
          explicit: track.explicit_content !== "0",
          path: createDownloadLink(track.more_info.encrypted_media_url),
          resolution: { bitDepth: 0, bitrate: 320000, name: "SR", sampleFormat: "s16p", sampleRate: 44100 },
          // prettier-ignore
          artists: Array.from(new Set(Object.values(track.more_info.artistMap).flat().map((a: any) => a.name))),
          thumb: track.image.replace("150x150", "500x500").replaceAll("50x50", "500x500").replaceAll("http://", "https://"),
        }) satisfies Track,
    );
}

export const Online = memo(() => {
  const [methods] = playerMethods.use();
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Track[]>([]);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setResults(await searchTracks(query).catch(() => []));
    setSearching(false);
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  useBlurMask(scrollRef);

  return (
    <div className="flex h-full w-full flex-col gap-7 overflow-hidden p-10 pb-5">
      <div className="flex h-fit w-full flex-row items-end justify-between border-(--border-color)/20">
        <div className="flex h-fit w-full flex-row gap-3">
          <button
            children={<MdDownloading className="scale-130" />}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
          <div className="font-medium">Downloader</div>
        </div>

        <div className="flex h-fit w-full items-center justify-center">
          <div className="relative">
            <input
              ref={ref}
              type="text"
              value={query}
              id="search-bar"
              spellCheck={false}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for music / albums / artists . . ."
              onKeyDown={(e) => {
                e.key.toLowerCase() === "enter" && (ref.current?.blur(), search());
                e.key.toLowerCase() === "escape" && (ref.current?.blur(), setQuery(""));
              }}
              className="flex h-fit w-md items-center rounded-l-md border-2 border-r-0 border-(--border-color)/20 bg-(--accent-color)/10 px-3 py-1 text-sm backdrop-blur-lg focus:outline-0"
            />
            <div style={{ opacity: !query ? 0.8 : 0 }} className="pointer-events-none absolute top-0 right-0 flex h-full shrink-0 flex-row items-center justify-center gap-1 px-2 text-xs font-bold">
              <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="Ctrl" />
              <div className="rounded-sm border-2 border-(--border-color)/10 px-1.5 py-px text-(--accent-color)/70" children="K / F" />
            </div>
          </div>

          <button
            onClick={search}
            disabled={searching}
            children={
              searching ? (
                <LuLoaderCircle className="animate-spin text-xl text-(--accent-color) transition-all" />
              ) : (
                <TbSearch className="text-xl text-(--accent-color) transition-all group-active:scale-90" />
              )
            }
            className="group flex h-full w-fit cursor-pointer items-center rounded-r-md border-2 border-(--border-color)/20 bg-(--accent-color)/20 px-3 py-1 backdrop-blur-lg"
          />
        </div>
      </div>

      <div className="flex h-fit w-full scrollbar-none flex-col items-center justify-between overflow-auto" ref={scrollRef}>
        {results.map((t, index) => (
          <TrackComponent
            file={t}
            key={t.id}
            index={index}
            isLiked={false}
            initial={index === 0}
            end={index === results.length - 1}
            onLike={() => alert("Download to like. . .")}
            onClick={() => (methods.destroy(), methods.enqueue([t]), console.log(t))}
            button1={<BiAddToQueue className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => methods.enqueue([t])} />}
            button2={<BiDownload className="shrink-0 cursor-pointer opacity-40" />}
            button3={<LuInfo className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" />}
          />
        ))}
      </div>

      {!results.length && (
        <div className="flex h-full w-full scrollbar-none flex-col items-center justify-center overflow-auto rounded-md border border-(--border-color)/20 bg-(--hover-color)/5 px-5 font-sans italic">
          Nothing to display
        </div>
      )}
    </div>
  );
});
