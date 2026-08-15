/** @format */

import axios from "axios";
import pkg from "../../../package.json";
import Player from "../player/index.js";
import { Root } from "../layouts/Root.js";
import { useState, useEffect } from "react";
import { themeStore } from "../stores/theme.js";
import { Fullscreen } from "../components/fullscreen";
import { AnimatePresence, motion } from "framer-motion";
import { flatten, hexToRgba, safeAwait, sleep } from "../../shared/helpers.js";
import { DirNode, MessagePayload, BaseTrack, Tree, API, Track } from "../../shared/types";
import { albumsStore, artistsStore, flattenedTreeStore, likedSongsStore, notificationsStore, pcmFormatStore, playlistDataStore, playlistIndexStore, treeStore } from "../stores";

export function Preload() {
  const [theme] = themeStore.use();
  const [, setTree] = treeStore.use();
  const [liked] = likedSongsStore.use();
  const [, setAlbums] = albumsStore.use();
  const [, setArtists] = artistsStore.use();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [, setFlat] = flattenedTreeStore.use();
  const [, setPcmFormat] = pcmFormatStore.use();
  const [playlistData] = playlistDataStore.use();
  const [playlistIndex] = playlistIndexStore.use();
  const [fullscreen, setFullscreen] = useState(false);
  const [, setNotifications] = notificationsStore.use();
  const [task, setTask] = useState<string>("Initializing");
  const [footer, setFooter] = useState<string | null>(null);

  window.api = new Proxy({} as API, {
    get(_, K) {
      return (...args: any[]) => window.invoke(String(K), ...args);
    },
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", theme.accent);
    document.documentElement.style.setProperty("--text-color", theme.type === "dark" ? "#ffffff" : "#000000");
    document.documentElement.style.setProperty("--hover-color", theme.type === "dark" ? "#000000" : "#ffffff");
    document.documentElement.style.setProperty("--border-color", theme.type === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  useEffect(() => localStorage.setItem("liked", JSON.stringify(liked)), [liked]);
  useEffect(() => localStorage.setItem("playlists", JSON.stringify(playlistIndex)), [playlistIndex]);
  useEffect(() => Object.keys(playlistData).forEach((K) => localStorage.setItem(K, JSON.stringify(playlistData[K]))), [playlistData]);

  useEffect(() => {
    const run = async () => {
      setTask("Initializing conns, deps and peers");

      const port = await window.api.getPort();
      const thumbPath = await window.api.getThumbPath();
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      await new Promise((r) => (ws.onopen = r));

      setPcmFormat(await window.api.getPcmFormat());

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

      const downloadProgress = (p: number, b: string) => (m: MessageEvent) => {
        const data = JSON.parse(m.data) as MessagePayload;
        if (data.type !== "PROGRESS") return;
        setProgress(p + (data.current / data.total) * 5);
        setFooter(`Downloading ${b} - ${(data.current / 1024 / 1024).toFixed(2)} MB / ${(data.total / 1024 / 1024).toFixed(2)} MB`);
      };

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
      const tree = await window.api.scan(mediaFolder);
      await window.api.setTree("mediaFolder", tree);
      await sleep(200);
      setProgress(50);

      setFooter("Generating diff for extraction");
      const flat = flatten(tree);
      let metas = await window.api.getAllMeta();
      const needsExtraction = flat.filter((file) => !metas[file.id]);
      const ids = Object.fromEntries(flat.map((file) => [file.id, 1]));
      const needsDeletion = Object.keys(metas).filter((key) => !ids[key]);

      if (needsExtraction.length) {
        ws.onmessage = (m: MessageEvent) => {
          const data = JSON.parse(m.data) as MessagePayload;
          if (data.type !== "PROGRESS") return;
          setTask("Extracting metadata and thumbnails");
          setFooter(`Processed ${data.current} / ${data.total} files`);
          setProgress(Math.floor(40 * (data.current / data.total)) + 50);
        };
        await window.api.extractAndSaveMetadata(needsExtraction);
        ws.onmessage = null;
      }

      setProgress(90);
      setTask(`Cleaning up residual data and files`);
      needsDeletion.length && (await window.api.deleteMeta(needsDeletion));
      needsDeletion.length && (await window.api.deleteThumbnails(needsDeletion));

      setProgress(95);
      setTask(`Syncing changes and generating tree`);
      setFooter(`Indexed ${needsExtraction.length} files and removed index for ${needsDeletion.length} files`);
      await sleep(100);

      const populateTreeWithMeta = (node: DirNode, metadata: { [K: string]: BaseTrack }) => {
        for (let i = 0; i < node.files.length; i++)
          (node.files[i] as any) = {
            ...node.files[i],
            ...metadata[node.files[i]!.id]!,
            thumb: `file:///${thumbPath}/thumbnail.${node.files[i]!.id}.jpg`.replaceAll(/\\/g, "/").replaceAll(/%2F/g, "/"),
          } satisfies BaseTrack;

        node.dirs.forEach((e) => populateTreeWithMeta(e, metadata));

        return node as unknown as Tree;
      };

      setTree(populateTreeWithMeta(tree, await window.api.getAllMeta()));

      let _ = flatten(tree as Tree).sort((a, b) => a.name.localeCompare(b.name));
      setFlat(_);

      _ = _.sort((a, b) => a.album.localeCompare(b.album));
      setAlbums(Object.groupBy(_, (e) => e.album));

      const __: Record<string, Set<Track>> = {};
      _.forEach((track) => (track.artists.forEach((artist) => (__[artist.trim()] ??= new Set()).add(track)), (__[track.artists.join(", ")] ??= new Set()).add(track)));

      const artists = Object.entries(__)
        .map(([K, V]): [string, Track[]] => [K, [...V]])
        .sort((a, b) => a[0].localeCompare(b[0]));

      setArtists(Object.fromEntries(artists));

      setFooter("Hope you enjoy your music");
      setTask("All done!");
      setProgress(100);
      await sleep(200);
      setReady(true);
      ws.close();

      const [res, err] = await safeAwait(axios.head("https://github.com/PAINFUEG0/MUZZiC/releases/latest"));
      if (err) return;

      const latestVersion = res.request.responseURL.split("/").at(-1);

      if (latestVersion !== `v${pkg.version}`)
        setNotifications((_) => [
          ..._,
          {
            id: "update",
            title: "A new version is available",
            body: (
              <div className="flex h-fit w-full flex-col gap-0.5 text-[10px] opacity-70">
                <div onClick={() => window.api.openExternal("https://github.com/PAINFUEG0/MUZZiC/releases/latest")} className="cursor-pointer hover:text-(--accent-color) hover:underline">
                  Click to visit the download page ( <span className="text-red-400">v{pkg.version}</span> → <span className="text-(--accent-color)">{latestVersion}</span> )
                </div>
                <div className="flex w-full flex-row items-center justify-end gap-1">
                  <div>~ com.painfuego.muzzic</div>
                </div>
              </div>
            ),
          },
        ]);
    };

    run();
  }, []);

  return (
    <div className="relative flex h-screen w-full shrink-0 flex-col overflow-hidden p-1.5 text-(--text-color)">
      <Player />

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            key={"FS"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            children={<Fullscreen setShow={setFullscreen} />}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 z-500 h-full w-full overflow-hidden bg-black"
          />
        )}
      </AnimatePresence>

      <img src={theme.background} style={{ filter: `blur(${theme.overall.blur})` }} className="absolute inset-0 -z-50 h-full w-full scale-110 object-cover" />

      <div className="absolute inset-0 -z-30 h-full w-full" style={{ backgroundColor: hexToRgba(theme.overall.tint.color, theme.overall.tint.opacity) }} />

      <div className="absolute inset-0 h-7 w-full cursor-pointer" style={{ WebkitAppRegion: "drag" } as any} />

      {ready ? (
        <Root fullscreen={fullscreen} setFullscreen={setFullscreen} />
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
