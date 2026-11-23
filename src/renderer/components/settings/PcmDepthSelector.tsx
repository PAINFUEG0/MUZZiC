/** @format */

import { memo } from "react";
import { PiWaveformBold } from "react-icons/pi";

export const PcmDepthSelector = memo(
  ({ pcmFormat, setPcmFormat }: { pcmFormat: "pcm_s16le" | "pcm_s24le" | "pcm_s32le"; setPcmFormat: React.Dispatch<React.SetStateAction<"pcm_s16le" | "pcm_s24le" | "pcm_s32le">> }) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-1 text-sm font-medium">
          <PiWaveformBold className="text-base text-(--accent-color)" />
          PCM output format
        </div>
        <div className="text-[10px] opacity-70">PCM bit depth used for decoding. Higher bit depths consume more memory and processing time.</div>
        <div className="-mt-1 text-[10px] opacity-70">This will provide no benefit unless your source audio is already 24-bit / 32-bit.</div>

        <div className="flex h-fit w-full flex-row gap-2 pt-1">
          {[
            { id: "pcm_s16le", label: "16-bit PCM ( s16le )", onClick: () => setPcmFormat("pcm_s16le") },
            { id: "pcm_s24le", label: "24-bit PCM ( s24le )", onClick: () => setPcmFormat("pcm_s24le") },
            { id: "pcm_s32le", label: "32-bit PCM ( s32le )", onClick: () => setPcmFormat("pcm_s32le") },
          ].map(({ id, label, onClick }) => (
            <button
              key={id}
              children={label}
              onClick={onClick}
              className={
                "flex h-fit w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border-2 px-2 pt-0.5 pb-1 text-xs text-nowrap backdrop-blur-2xl transition-all duration-100 hover:scale-105 active:scale-95 " +
                (id === pcmFormat ? " border-(--accent-color)/45 bg-(--accent-color)/8" : "border-(--border-color)/15 bg-(--border-color)/10")
              }
            />
          ))}
        </div>
      </div>
    );
  },
);
