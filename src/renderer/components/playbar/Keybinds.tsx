/** @format */

import { memo, useEffect, useRef } from "react";
import { sceneStore, playerMethods, playerState, playerEffects } from "../../stores";

export const Keybinds = memo(({ fullscreen, setFullscreen }: { fullscreen: boolean; setFullscreen: (arg: boolean) => void }) => {
  const [state] = playerState.use();
  const [, setFX] = playerEffects.use();
  const [, setScene] = sceneStore.use();
  const [{ seekTo }] = playerMethods.use();

  const _state = useRef(state);
  const _fullscreen = useRef(fullscreen);
  useEffect(() => void (_state.current = state), [state]);
  useEffect(() => void (_fullscreen.current = fullscreen), [fullscreen]);

  useEffect(() => {
    const keybinds: Record<string, () => void> = {
      // playbar buttons
      KeyE: () => document.getElementById("eq-button")!.click(),
      KeyL: () => document.getElementById("like-button")!.click(),
      KeyS: () => document.getElementById("sleep-button")!.click(),
      KeyC: () => document.getElementById("crossfeed-button")!.click(),
      KeyM: () => document.getElementById("mute-unmute-button")!.click(),

      // scenes
      _KeyL: () => setScene({ scene: "liked" }),
      _KeyQ: () => setScene({ scene: "queue" }),
      _KeyR: () => setScene({ scene: "radio" }),
      _KeyT: () => setScene({ scene: "tracks" }),
      _KeyE: () => setScene({ scene: "explorer" }),
      _KeyD: () => setScene({ scene: "downloads" }),

      // fullscreen
      Escape: () => _fullscreen && setFullscreen(false),
      KeyF: () => _state.current.current && setFullscreen(true),

      // volume
      ArrowUp: () => setFX((_) => ({ ..._, PG: Math.min(100, _.PG + 5) })),
      ArrowDown: () => setFX((_) => ({ ..._, PG: Math.max(0, _.PG - 5) })),
      _ArrowUp: () => setFX((_) => ({ ..._, IG: Math.min(100, _.IG + 5) })),
      _ArrowDown: () => setFX((_) => ({ ..._, IG: Math.max(0, _.IG - 5) })),

      // layback controls
      Space: () => document.getElementById("play-pause-button")!.click(),
      ArrowLeft: () => document.getElementById("seekBackward-button")!.click(),
      ArrowRight: () => document.getElementById("seekForward-button")!.click(),
    };

    for (const _ of ["Digit", "Numpad"]) for (let i = 0; i < 10; i++) keybinds[`${_}${i}`] = () => seekTo(_state.current.duration * (i / 10));

    const listener = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "INPUT") return;

      (e.ctrlKey || e.metaKey) && ["k", "f"].includes(e.key.toLowerCase()) && (e.preventDefault(), document.getElementById("search-bar")!.focus());
      e.code in keybinds && (e.preventDefault(), keybinds[e.code]!());
      `_${e.code}` in keybinds && e.shiftKey && (e.preventDefault(), keybinds[`_${e.code}`]!());
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return null;
});
