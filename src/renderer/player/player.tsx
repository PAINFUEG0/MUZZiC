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

  const play = useCallback(async (src: string) => {
    audioRef.current!.src = "";
    audioRef.current!.src = await window.api.transcode(src);
    await audioRef.current!.play();
  }, []);

  const pause = useCallback(() => audioRef.current!.pause(), []);
  const resume = useCallback(() => audioRef.current!.play(), []);

  const clearQueue = useCallback(() => (setIndex(0), setQueue([])), []);
  const enqueue = useCallback((track: Track[]) => setQueue((q) => [...q, ...track]), []);

  const seekForward = useCallback(() => (audioRef.current!.currentTime += 10), []);
  const seekBackward = useCallback(() => (audioRef.current!.currentTime -= 10), []);
  const seekTo = useCallback((time: number) => (audioRef.current!.currentTime = time), []);

  const jumpTo = useCallback((i: number) => setIndex(i), []);
  const skip = useCallback(() => setIndex((i) => (i + 1 >= _queue.current.length ? i : i + 1)), []);
  const prev = useCallback(() => (_progress.current > 10 ? (audioRef.current!.currentTime = 0) : setIndex((i) => Math.max(0, i - 1))), []);

  const destroy = useCallback(() => {
    setIndex(0);
    setQueue([]);
    setProgress(0);
    audioRef.current!.pause();
    audioRef.current!.src = "";
    setState((s) => ({ ...s, isPlaying: false, duration: 0, current: null }));
  }, []);

  useEffect(() => {
    const _ = audioRef.current!;
    _.addEventListener("ended", skip);
    _.addEventListener("play", () => setState((s) => ({ ...s, isPlaying: true })));
    _.addEventListener("pause", () => setState((s) => ({ ...s, isPlaying: false })));
    _.addEventListener("timeupdate", () => setProgress(Math.floor(_.currentTime || 0)));
    _.addEventListener("loadedmetadata", () => setState((s) => ({ ...s, duration: Math.floor(_.duration) })));
  }, []);

  useEffect(() => void (_queue.current = queue), [queue]);
  useEffect(() => void (_progress.current = progress), [progress]);
  useEffect(() => void (state.current && play(state.current.path)), [state.current?.path]);
  useEffect(() => setState((s) => ({ ...s, current: queue[index] || null })), [queue, index]);
  useEffect(
    () => setMethods({ play, pause, resume, clearQueue, enqueue, seekForward, seekBackward, seekTo, jumpTo, skip, prev, destroy }),
    [],
  );

  return component;
}

export interface PlayerMethods {
  play: (src: string) => void;
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
