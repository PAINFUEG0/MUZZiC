/** @format */

import { Track } from "../../shared/types";
import { useCallback, useEffect, useRef } from "react";
import { playerQueue, playerIndex, playerMethods, playerState, playerProgress } from "../utils/stores";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const component = <audio ref={audioRef} crossOrigin="anonymous" />;

  const [, setMethods] = playerMethods.use();
  const [queue, setQueue] = playerQueue.use();
  const [index, setIndex] = playerIndex.use();
  const [state, setState] = playerState.use();
  const [progress, setProgress] = playerProgress.use();

  const _queue = useRef(queue);
  const _progress = useRef(progress);

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
      if (_progress.current > 10 || i === 0) return (audioRef.current!.currentTime = 0);
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

  useEffect(() => {
    const __ = audioRef.current!;
    __.addEventListener("ended", (setState((_) => ({ ..._, duration: 0 })), skip));
    __.addEventListener("play", () => setState((_) => ({ ..._, isPlaying: true })));
    __.addEventListener("pause", () => setState((_) => ({ ..._, isPlaying: false })));
    __.addEventListener("timeupdate", () => setProgress(Math.floor(__.currentTime || 0)));
    __.addEventListener("loadedmetadata", () => setState((_) => ({ ..._, duration: Math.floor(__.duration) })));
  }, []);

  useEffect(() => void (_queue.current = queue), [queue]);
  useEffect(() => void (_progress.current = progress), [progress]);
  useEffect(() => {
    (async () => {
      audioRef.current!.src = "";
      if (!state.current?.path) return;
      const res = await window.api.transcode(state.current?.path);
      if (res) {
        audioRef.current!.src = res;
        await audioRef.current!.play();
      }
    })();
  }, [state.current?.path]);

  useEffect(() => setState((s) => ({ ...s, current: queue[index] || null })), [queue, index]);
  useEffect(() => setMethods({ pause, resume, clearQueue, enqueue, seekForward, seekBackward, seekTo, jumpTo, skip, prev, destroy }), []);

  return component;
}

export interface PlayerMethods {
  // play: (src: string) => void;
  pause: () => void;
  resume: () => void;
  clearQueue: () => void;
  enqueue: (track: Track[]) => void;
  seekForward: () => void;
  seekBackward: () => void;
  seekTo: (time: number) => void;
  jumpTo: (i: number) => void;
  skip: () => void;
  prev: () => void;
  destroy: () => void;
}
