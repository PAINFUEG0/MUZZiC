/** @format */

import { memo, useEffect, useRef } from "react";
import { sceneStore, playerMethods, playerState, playerEffects } from "../../stores";

export const Keybinds = memo(({ fullscreen, setFullscreen }: { fullscreen: boolean; setFullscreen: (arg: boolean) => void }) => {
  const [state] = playerState.use();
  const [methods] = playerMethods.use();
  const [, setFX] = playerEffects.use();
  const [, setScene] = sceneStore.use();

  const _state = useRef(state);
  const _fullscreen = useRef(fullscreen);
  useEffect(() => void (_state.current = state), [state]);
  useEffect(() => void (_fullscreen.current = fullscreen), [fullscreen]);

  useEffect(() => {
    const keybinds: Record<string, () => void> = {
      ArrowLeft: methods.seekBackward,
      ArrowRight: methods.seekForward,
      KeyQ: () => setScene({ scene: "queue" }),
      KeyS: () => setScene({ scene: "settings" }),
      Escape: () => _fullscreen && setFullscreen(false),
      KeyM: () => setFX((_) => ({ ..._, mute: !_.mute })),
      KeyF: () => _state.current.current && setFullscreen(true),
      KeyL: () => document.getElementById("like-button")!.click(),
      ArrowUp: () => setFX((_) => ({ ..._, PG: Math.min(100, _.PG + 5) })),
      ArrowDown: () => setFX((_) => ({ ..._, PG: Math.max(0, _.PG - 5) })),
      _ArrowUp: () => setFX((_) => ({ ..._, IG: Math.min(100, _.IG + 5) })),
      _ArrowDown: () => setFX((_) => ({ ..._, IG: Math.max(0, _.IG - 5) })),
      Space: () => (_state.current.isPlaying ? methods.pause() : methods.resume()),
    };

    for (const _ of ["Digit", "Numpad"]) for (let i = 0; i < 10; i++) keybinds[`${_}${i}`] = () => methods.seekTo(_state.current.duration * (i / 10));

    const listener = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "INPUT") return;

      (e.ctrlKey || e.metaKey) && ["k", "f"].includes(e.key.toLowerCase()) && (e.preventDefault(), document.getElementById("search-bar")!.focus());
      e.code in keybinds && (e.preventDefault(), keybinds[((e.shiftKey && "_") || "") + e.code]!());
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return null;
});
