/** @format */

import { useEffect, useRef } from "react";
import { sceneStore, playerMethods, playerState, playerEffects, selected, selectMode } from "../stores";

export function useKeybinds(fullscreen: boolean, setFullscreen: React.Dispatch<React.SetStateAction<boolean>>) {
  const [state] = playerState.use();
  const [, setFX] = playerEffects.use();
  const [, setScene] = sceneStore.use();
  const [, setSelctions] = selected.use();
  const [{ seekTo }] = playerMethods.use();
  const [inSelectionMode, setInSelectionMode] = selectMode.use();

  const _state = useRef(state);
  const _fullscreen = useRef(fullscreen);
  const _inSelectionMode = useRef(inSelectionMode);
  useEffect(() => void (_state.current = state), [state]);
  useEffect(() => void (_fullscreen.current = fullscreen), [fullscreen]);
  useEffect(() => void (_inSelectionMode.current = inSelectionMode), [inSelectionMode]);

  useEffect(() => {
    const keybinds: Record<string, () => void> = {
      // scenes
      _KeyL: () => setScene({ scene: "liked" }),
      _KeyQ: () => setScene({ scene: "queue" }),
      _KeyR: () => setScene({ scene: "radio" }),
      _KeyT: () => setScene({ scene: "tracks" }),
      _KeyE: () => setScene({ scene: "explorer" }),
      _KeyD: () => setScene({ scene: "downloads" }),

      // playbar buttons
      KeyE: () => document.getElementById("eq-button")!.click(),
      KeyL: () => document.getElementById("like-button")!.click(),
      KeyS: () => document.getElementById("sleep-button")!.click(),
      KeyC: () => document.getElementById("crossfeed-button")!.click(),
      KeyM: () => document.getElementById("mute-unmute-button")!.click(),

      // fullscreen
      KeyF: () => _state.current.current && setFullscreen((_) => !_),
      Escape: () => (_fullscreen.current ? setFullscreen(false) : _inSelectionMode.current ? (setInSelectionMode(false), setSelctions([])) : null),

      // volume
      ArrowUp: () => setFX((_) => ({ ..._, PG: Math.min(150, _.PG + 5) })),
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

      if ((e.ctrlKey || e.metaKey) && ["k", "f"].includes(e.key.toLowerCase())) return (e.preventDefault(), document.getElementById("search-bar")!.focus());
      if (`_${e.code}` in keybinds && e.shiftKey) return (e.preventDefault(), keybinds[`_${e.code}`]!());
      if (e.code in keybinds) return (e.preventDefault(), keybinds[e.code]!());
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
}
