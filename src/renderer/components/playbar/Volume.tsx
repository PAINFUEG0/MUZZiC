/** @format */

import Slider from "../utils/Slider";
import { memo } from "react";
import { volumeSettings } from "../../player";
import { LuVolumeOff, LuVolume, LuVolume1, LuVolume2 } from "react-icons/lu";

export const Volume = memo(() => {
  const [volume, setVolume] = volumeSettings.use();

  return (
    <div className="flex h-fit flex-col">
      <div className="flex h-fit w-fit flex-row items-center gap-1.5">
        <div id="mute-unmute-button" onClick={() => setVolume((_) => ({ ..._, muted: !_.muted }))} className="w-5 cursor-pointer">
          {volume.muted || volume.volume === 0 ? <LuVolumeOff /> : volume.volume > 0 && volume.volume <= 30 ? <LuVolume /> : volume.volume > 30 && volume.volume <= 60 ? <LuVolume1 /> : <LuVolume2 />}
        </div>

        <Slider
          min={0}
          step={1}
          max={150}
          className="h-1 w-25"
          value={volume.volume}
          thumb={{ height: "0.70rem", width: "0.70rem" }}
          onChange={(e) => setVolume((_) => ({ ..._, volume: Number(e.target.value) }))}
        />
        <div className="flex w-7 flex-row items-center justify-start text-xs">{volume.volume}%</div>
      </div>
    </div>
  );
});
