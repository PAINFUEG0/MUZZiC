/** @format */

import { Sleep } from "./Sleep";
import { Volume } from "./Volume";
import { memo, useState } from "react";
import { SiDolby } from "react-icons/si";
import { LuSlidersVertical } from "react-icons/lu";
import { surroundSettings, playerState } from "../../player";
import { crossfeedSettings, likedSongsStore, sceneStore, sleepTimer } from "../../stores";
import { RiHeartFill, RiHeartLine, RiLoopRightFill, RiLoopRightAiLine, RiMoonFill } from "react-icons/ri";
import { BiSolidSpeaker } from "react-icons/bi";

type T = ReturnType<(typeof playerState)["use"]>;
type Props = { id: string | null; repeatMode?: boolean; canCF: boolean; setState: T[1] };

export const FXControls = memo(({ id, repeatMode, canCF, setState }: Props) => {
  const [, setScene] = sceneStore.use();
  const [liked, setLiked] = likedSongsStore.use();
  const [sleepTime, setSleepTime] = sleepTimer.use();
  const [surround, setSurround] = surroundSettings.use();
  const [crossfeed, setCrossfeed] = crossfeedSettings.use();
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  return (
    <div className="flex h-full w-full flex-row items-center justify-end gap-10 px-7">
      <div className={"grid gap-5 xl:pr-3 " + (canCF ? "grid-cols-6" : "grid-cols-4")}>
        <div
          id="like-button"
          children={id && liked.includes(id) ? <RiHeartFill /> : <RiHeartLine />}
          className={"cursor-pointer active:scale-85 " + (liked.includes(id!) ? " text-(--accent-color)" : "")}
          onClick={() => id && setLiked((liked) => (liked.includes(id) ? liked.filter((e) => e !== id) : [...liked, id]))}
        />

        {canCF && (
          <div
            id="surround-button"
            children={<SiDolby />}
            onClick={() => setSurround((s) => ({ ...s, enabled: !s.enabled }))}
            className={"cursor-pointer active:scale-85 " + (surround.enabled ? "text-(--accent-color)" : "")}
          />
        )}

        <div
          onClick={() => setState((_) => ({ ..._, loop: !_.loop }))}
          children={repeatMode ? <RiLoopRightAiLine /> : <RiLoopRightFill />}
          className={"cursor-pointer active:scale-85 " + (repeatMode ? " text-(--accent-color)" : "")}
        />

        {canCF && (
          <div
            id="crossfeed-button"
            children={<BiSolidSpeaker />}
            onClick={() => canCF && setCrossfeed((_) => ({ ..._, enabled: !_.enabled }))}
            className={"cursor-pointer active:scale-85 " + (crossfeed.enabled ? "text-(--accent-color)" : "")}
          />
        )}

        <div id="sleep-button" onClick={() => setShowSleepTimerModal(true)} children={<RiMoonFill />} className={"cursor-pointer active:scale-85 " + (sleepTime ? "text-(--accent-color)" : "")} />

        <div id="eq-button" onClick={() => setScene({ scene: "equalizer" })} children={<LuSlidersVertical />} className="cursor-pointer hover:text-(--accent-color) active:scale-85" />
      </div>

      <Volume />

      <Sleep show={showSleepTimerModal} setShow={setShowSleepTimerModal} sleepTime={sleepTime} setSleepTime={setSleepTime} />
    </div>
  );
});
