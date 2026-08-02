/** @format */

import { memo, useRef } from "react";
import { Track } from "../../../shared/types";
import { useBlurMask } from "../../hooks/useBlurMask";
import { formatDuration } from "../../../shared/helpers";

export const TrackInfo = memo(({ track }: { track: Track }) => {
  const res = track.resolution;
  const scrollRef = useRef<HTMLDivElement>(null);

  useBlurMask(scrollRef);

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <img src={track.thumb} className="pointer-events-none absolute inset-0 -z-1 h-full w-full opacity-50 blur-lg" />

      <div className="flex h-fit w-full shrink-0 pr-30" children={<div className="w-full min-w-0 flex-1 truncate font-semibold" children={track.title} />} />

      <div className="flex h-fit w-full flex-row gap-3">
        <img src={track.thumb} className="aspect-square h-[30dvh] shrink-0 overflow-hidden rounded-md border-2 border-(--border-color)/20 object-cover" />
        <div ref={scrollRef} className="flex h-[30dvh] w-full scrollbar-none flex-col gap-1 overflow-auto">
          {[
            { K: "ID", V: track.id },
            { K: "Album", V: track.album },
            { K: "Artist", V: track.artists?.join(", ") },
            { K: "Bitrate", V: Math.round(track.resolution.bitrate / 1024) + " kb/s - " + track.codec.toUpperCase() + " " },
            { K: "Channels", V: track.channels + (track.layout && " ( " + track.layout.toUpperCase() + " ) ") },
            { K: "Duration", V: formatDuration(track.duration).split(":").join(" minutes ") + " seconds" },
            { K: "Explicit", V: track.explicit ? "Explicit" : "Clean / Unrated" },
            { K: "Resolution", V: `${res.name} - ${res.bitDepth} bit - ${res.sampleRate / 1000} kHz - ${res.sampleFormat}` },
            { K: "File name", V: track.name },
            { K: "Located at", V: track.path.replaceAll("\\", "/").replaceAll("/", " / ") },
          ].map((_) => (
            <div className="flex h-fit w-full flex-row items-start gap-2">
              <div className="flex w-fit shrink-0 text-xs font-medium" children={_.K} />
              <div className="flex w-fit shrink-0 text-xs font-medium" children="-" />
              <div className="flex w-full text-xs wrap-anywhere opacity-70" children={_.V} />
            </div>
          ))}
          {[
            <div className="flex h-fit w-full flex-row items-start gap-2">
              <div className="flex w-fit shrink-0 text-xs font-medium" children="Lyrics" />
              <div className="flex w-fit shrink-0 text-xs font-medium" children="-" />
              <div className="flex w-full flex-col text-xs wrap-anywhere opacity-70">
                {track.lyrics
                  .replaceAll("[", "\n[ ")
                  .split("\n")
                  .map((_) => (
                    <div>{_.replace("]", " ] - ")}</div>
                  ))}
              </div>
            </div>,
          ]}
        </div>
      </div>
    </div>
  );
});
