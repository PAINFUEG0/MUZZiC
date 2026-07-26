/** @format */

import { AudioGraph } from "./audioGraph";
import { Track } from "../../shared/types";
import { sleepTimer } from "../utils/stores";
import { useCallback, useEffect, useRef } from "react";
import { playerEffects, playerMethods, playerQueue, playerIndex, playerState, playerProgress } from "./store";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const component = <audio ref={audioRef} crossOrigin="anonymous" />;

  const [, setFX] = playerEffects.use();
  const [, setMethods] = playerMethods.use();
  const [queue, setQueue] = playerQueue.use();
  const [index, setIndex] = playerIndex.use();
  const [state, setState] = playerState.use();
  const [sleepTime, setSleepTime] = sleepTimer.use();
  const [progress, setProgress] = playerProgress.use();

  const _state = useRef(state);
  const _queue = useRef(queue);
  const _progress = useRef(progress);
  const _sleepTime = useRef(sleepTime);

  const { initializeAudioGraph } = AudioGraph({ audioRef });

  const pause = useCallback(() => audioRef.current!.pause(), []);
  const resume = useCallback(() => audioRef.current!.play(), []);

  const clearQueue = useCallback(() => (setIndex(0), setQueue([])), []);
  const enqueue = useCallback((track: Track[]) => setQueue((q) => [...q, ...track]), []);

  const seekForward = useCallback(() => (audioRef.current!.currentTime += 10), []);
  const seekBackward = useCallback(() => (audioRef.current!.currentTime -= 10), []);
  const seekTo = useCallback((time: number) => (audioRef.current!.currentTime = time), []);

  const jumpTo = useCallback((i: number) => {
    setState((_) => ({ ..._, duration: 0 }));
    setIndex(i);
  }, []);

  const skip = useCallback(() => {
    setIndex((i) => {
      if (i == _queue.current.length - 1) return i;
      setState((_) => ({ ..._, duration: 0 }));
      return i + 1;
    });
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => {
      if (_progress.current > 10 || i === 0) return ((audioRef.current!.currentTime = 0), i);
      setState((_) => ({ ..._, duration: 0 }));
      return Math.max(0, i - 1);
    });
  }, []);

  const destroy = useCallback(() => {
    setIndex(0);
    setQueue([]);
    setProgress(0);
    audioRef.current!.pause();
    audioRef.current!.src = "";
    setState((s) => ({ ...s, isPlaying: false, duration: 0, current: null }));
  }, []);

  useEffect(() => void (_state.current = state), [state]);
  useEffect(() => void (_queue.current = queue), [queue]);
  useEffect(() => void (_progress.current = progress), [progress]);
  useEffect(() => void (_sleepTime.current = sleepTime), [sleepTime]);

  useEffect(() => {
    initializeAudioGraph();

    const __ = audioRef.current!;

    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", resume);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("nexttrack", skip);
    navigator.mediaSession.setActionHandler("previoustrack", prev);

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "INPUT") return;

      const key = e.code;

      const keybinds: Record<string, () => void> = {
        ArrowLeft: seekBackward,
        ArrowRight: seekForward,
        KeyM: () => setFX((_) => ({ ..._, muted: !_.muted })),
        Space: () => (e.preventDefault(), _state.current.isPlaying ? pause() : resume()),
        ArrowUp: () => (e.preventDefault(), setFX((_) => ({ ..._, volume: Math.min(100, _.volume + 5) }))),
        ArrowDown: () => (e.preventDefault(), setFX((_) => ({ ..._, volume: Math.max(0, _.volume - 5) }))),
      };

      for (let i = 0; i < 10; i++) keybinds[`Numpad${i}`] = keybinds[`Digit${i}`] = () => seekTo(_state.current.duration * (i / 10));

      key in keybinds && keybinds[key]!();
    });

    __.addEventListener("timeupdate", () => {
      if (!_sleepTime.current) return;
      if (Date.now() < _sleepTime.current) return;
      if (Date.now() - _sleepTime.current < 2000) pause();
      setSleepTime(0);
    });

    __.addEventListener("play", () => setState((_) => ({ ..._, isPlaying: true })));
    __.addEventListener("pause", () => setState((_) => ({ ..._, isPlaying: false })));
    __.addEventListener("timeupdate", () => setProgress(Math.floor(__.currentTime || 0)));
    __.addEventListener("loadedmetadata", () => setState((_) => ({ ..._, duration: Math.floor(__.duration) })));
    __.addEventListener("ended", () => (_state.current.loop ? resume() : (setState((_) => ({ ..._, duration: 0 })), skip())));
  }, []);

  useEffect(() => setState((s) => ({ ...s, current: queue[index] || null })), [queue, index]);

  useEffect(() => {
    audioRef.current!.src = "";
    if (!state.current?.path) return;
    window.api.transcode(state.current?.path).then((res) => void (res && ((audioRef.current!.src = res), audioRef.current!.play())));
  }, [state.current?.path]);

  useEffect(() => setMethods({ pause, resume, clearQueue, enqueue, seekForward, seekBackward, seekTo, jumpTo, skip, prev, destroy }), []);

  return component;
}
