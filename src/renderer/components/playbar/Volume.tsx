/** @format */

import Slider from "../utils/Slider";
import { memo, useState } from "react";
import { volumeSettings } from "../../player";
import { LuVolumeOff, LuVolume, LuVolume1, LuVolume2 } from "react-icons/lu";

export const Volume = memo(() => {
  const [volume, setVolume] = volumeSettings.use();
  const [channel, setChannel] = useState<"left" | "right" | "volume">("volume");

  return (
    <div className="flex h-fit flex-col">
      <div className="-mt-4 flex h-fit w-full flex-row items-center justify-center gap-1.5 text-[10px]">
        <div children="L" className={"cursor-pointer " + (channel == "left" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setChannel("left")} />
        <div children="-" />
        <div children="VOL" className={"cursor-pointer " + (channel == "volume" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setChannel("volume")} />
        <div children="-" />
        <div children="R" className={"cursor-pointer " + (channel == "right" ? "text-(--accent-color)" : "opacity-70")} onClick={() => setChannel("right")} />
      </div>

      <div className="flex h-fit w-fit flex-row items-center gap-1.5">
        <div id="mute-unmute-button" onClick={() => setVolume((_) => ({ ..._, muted: !_.muted }))} className="w-5 cursor-pointer">
          {volume.muted || volume[channel] === 0 ? (
            <LuVolumeOff />
          ) : volume[channel] > 0 && volume[channel] <= 30 ? (
            <LuVolume />
          ) : volume[channel] > 30 && volume[channel] <= 60 ? (
            <LuVolume1 />
          ) : (
            <LuVolume2 />
          )}
        </div>

        <Slider
          min={0}
          step={1}
          className="h-1 w-25"
          value={volume[channel]}
          max={channel === "volume" ? 150 : 100}
          thumb={{ height: "0.70rem", width: "0.70rem" }}
          onChange={(e) => setVolume((_) => ({ ..._, [channel]: Number(e.target.value) }))}
        />
        <div className="flex w-7 flex-row items-center justify-start text-xs">{volume[channel]}%</div>
      </div>
    </div>
  );
});
