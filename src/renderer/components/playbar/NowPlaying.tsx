/** @format */

import { memo } from "react";
import { LuExpand } from "react-icons/lu";
import { Track } from "../../../shared/types";

const _ = { DD: "Spatial ( DD / DTS )", CD: "CD Lossless", HR: "Hi-Res Lossless", SR: "Standard (Lossy)" };

export const NowPlaying = memo(({ index, queueLength, track }: { index: number; queueLength: number; track: Track | null }) => {
  return (
    <div className="flex h-20 w-full min-w-0 flex-row gap-3 p-2">
      <button className="relative aspect-square h-full shrink-0 cursor-pointer overflow-hidden rounded-md transition-all duration-100 active:scale-95">
        <img
          src={track?.thumb || "./logo.png"}
          className="-z-1 h-full w-full object-contain"
          onError={(e) => (e.currentTarget.src = "./logo.png")}
        />
        <div
          children={<LuExpand className="opacity-70" />}
          className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/70 text-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
        />
      </button>

      {!track ? (
        <div className="flex h-full flex-col items-start justify-center">
          <div className="text-sm font-bold">Nothing is being played right now</div>
          <div className="text-[9px] font-medium text-(--accent-color)">Please enqueue some song/s to get started</div>
        </div>
      ) : (
        <div className="flex h-full w-full min-w-0 flex-col items-start justify-between">
          <div children={`Album - ${track.album}`} className="h-fit w-full min-w-0 flex-1 truncate text-[10px] font-medium opacity-60" />
          <div children={`${track.title}`} className="-mt-1 mb-px h-fit w-full min-w-0 flex-1 truncate text-sm font-bold opacity-80" />
          <div
            children={`Artist/s - ${track.artists}`}
            className="h-fit w-full min-w-0 flex-1 truncate text-[10px] font-medium opacity-60"
          />

          <div className="h-fit w-full text-[9px] font-light opacity-70">
            {[
              <span children={`${index + 1} / ${queueLength}`} />,
              <span children={track.codec.toUpperCase()} />,
              <span children={`${track.layout.toUpperCase().replaceAll("(", " ( ").replaceAll(")", " ) ")}`} />,
              track.resolution.bitDepth ? [<span children={`${track.resolution.bitDepth} bit`} />] : null,
              track.resolution.sampleRate ? <span children={`${track.resolution.sampleRate / 1000} kHz`} /> : null,
              track.resolution.bitrate ? <span children={`${Math.round(track.resolution.bitrate / 1000)} kbps`} /> : null,
              <span children={_[track.resolution.name]} />,
            ]
              .filter(Boolean)
              .flatMap((_, i, arr) => [_, i !== arr.length - 1 && <span className="px-1">|</span>])}
          </div>
        </div>
      )}
    </div>
  );
});
