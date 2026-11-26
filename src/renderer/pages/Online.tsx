/** @format */

import axios from "axios";
import { util, cipher } from "node-forge";
import { playerMethods } from "../stores";
import { Track } from "../../shared/types";
import { MdDownloading } from "react-icons/md";
import { useBlurMask } from "../hooks/useBlurMask";
import { LuInfo, LuLoaderCircle } from "react-icons/lu";
import { useVirtualList } from "../hooks/useVirtualList";
import { BiAddToQueue, BiDownload } from "react-icons/bi";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Track as TrackComponent } from "../components/utils/Track";
import { TbSearch } from "react-icons/tb";
import { IoWarning } from "react-icons/io5";

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
          resolution: { bitDepth: 0, bitrate: 320 * 1024, name: "SR", sampleFormat: "s16p", sampleRate: 44100 },
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Track[] | null>(null);

  useBlurMask(scrollRef);

  useEffect(() => {
    if (!query.trim()) return setResults(null);

    const timer = setTimeout(async () => {
      setResults([]);
      setSearching(true);
      setResults(await searchTracks(query).catch(() => []));
      setSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query.trim()]);

  useEffect(() => void virtualizer.scrollToOffset(0, { behavior: "smooth" }), [results]);

  const [list, virtualizer] = useVirtualList({
    scrollRef,
    list: results || [],
    getItemKey: useCallback((index) => results![index]!.id, [results]),
    Component: useCallback(
      ({ index }) => (
        <TrackComponent
          index={index}
          isLiked={false}
          initial={index === 0}
          file={results![index]!}
          key={results![index]!.id}
          end={index === results!.length - 1}
          onLike={() => alert("Download to like. . .")}
          onClick={() => (methods.destroy(), methods.enqueue([results![index]!]))}
          button2={<BiDownload className="shrink-0 cursor-pointer opacity-40" />}
          button3={<LuInfo className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" />}
          button1={<BiAddToQueue className="shrink-0 cursor-pointer transition-all duration-100 active:scale-90" onClick={() => methods.enqueue([results![index]!])} />}
        />
      ),
      [results],
    ),
  });

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
              onKeyDown={(e) => (e.key.toLowerCase() === "enter" || e.key.toLowerCase() === "escape") && ref.current?.blur()}
              className="flex h-fit w-md items-center rounded-l-md border-2 border-r-0 border-(--border-color)/20 bg-(--accent-color)/10 px-3 py-1 text-sm backdrop-blur-lg focus:outline-0"
            />
            <div
              children="Ctrl + K"
              style={{ opacity: !query ? 0.8 : 0 }}
              className="pointer-events-none absolute top-0 right-0 flex h-full shrink-0 flex-row items-center justify-center gap-1 px-2 text-xs font-medium text-(--accent-color)/70"
            />
          </div>

          <button
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

      <div className="-mt-5 -mb-4 flex h-2 w-full shrink-0 items-center justify-end pr-3 text-xs text-(--accent-color) opacity-90">{results && `Searched and found ${results.length} results`}</div>

      {searching ? (
        <div
          ref={scrollRef}
          children={[<LuLoaderCircle className="mr-2 animate-spin text-xl text-(--accent-color) transition-all" />, `Searching for "${query}" on JioSaavn`]}
          className="flex h-full w-full flex-row items-center justify-center rounded-md border-2 border-(--border-color)/20 bg-(--hover-color)/5 px-5 font-sans italic"
        />
      ) : results ? (
        results?.length ? (
          <div ref={scrollRef} className="h-full min-h-0 w-full scrollbar-none overflow-y-auto" children={list} />
        ) : (
          <div
            ref={scrollRef}
            children={[<IoWarning className="mr-2 text-xl text-(--accent-color)" />, `No results found for "${query}"`]}
            className="flex h-full w-full flex-row items-center justify-center rounded-md border-2 border-(--border-color)/20 bg-(--hover-color)/5 px-5 font-sans italic"
          />
        )
      ) : (
        <div ref={scrollRef} className="flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-(--border-color)/20 bg-(--hover-color)/5 px-5 font-sans italic">
          <MdDownloading className="mb-4 text-4xl text-(--accent-color)/50" />
          <span className="text-sm font-semibold">Discover and download music</span>
          <span className="mt-2 max-w-sm text-center text-xs leading-relaxed text-(--text-color)/50">
            Search JioSaavn for your favourite songs, albums, and artists. Find tracks, preview their details, and add them to your download queue or start playing them instantly.
          </span>
        </div>
      )}
    </div>
  );
});
