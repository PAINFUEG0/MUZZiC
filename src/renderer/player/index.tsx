/** @format */

export * from "./volumeUnit";
export * from "../stores/player";
import { EqNodes } from "./equalizer";
import { sleepTimer } from "../stores";
import { CrossFeed } from "./crossfeed";
import { Track } from "../../shared/types";
import { useCallback, useEffect, useRef } from "react";
import { dbToGain, safeAwait } from "../../shared/helpers";
import { playerEffects, playerMethods, playerQueue, playerIndex, playerState, playerProgress, analyzersNodes } from "./index";

export default function Player() {
  const ctx = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);

  const [fx] = playerEffects.use();
  const [, setMethods] = playerMethods.use();
  const [queue, setQueue] = playerQueue.use();
  const [index, setIndex] = playerIndex.use();
  const [state, setState] = playerState.use();
  const [, setAnalyzer] = analyzersNodes.use();
  const [sleepTime, setSleepTime] = sleepTimer.use();
  const [progress, setProgress] = playerProgress.use();

  const initialVolume = useRef(fx.PG);
  const initialInputGain = useRef(fx.IG);

  const analyserLeft = useRef<AnalyserNode | null>(null);
  const analyserRight = useRef<AnalyserNode | null>(null);
  const analyserOverall = useRef<AnalyserNode | null>(null);

  const PG = useRef<GainNode | null>(null); // Post gain
  const IG = useRef<GainNode | null>(null); // Input gain
  const EQ = useRef<ReturnType<typeof EqNodes> | null>(null);
  const CF = useRef<ReturnType<typeof CrossFeed> | null>(null);

  const _state = useRef(state);
  const _queue = useRef(queue);
  const _progress = useRef(progress);
  const _sleepTime = useRef(sleepTime);

  const pause = useCallback(() => audioRef.current!.pause(), []);
  const resume = useCallback(() => audioRef.current!.play(), []);

  const clearQueue = useCallback(() => (setIndex(0), setQueue([])), []);
  const enqueue = useCallback((track: Track[]) => setQueue((q) => [...q, ...track]), []);

  const destroy = useCallback(() => {
    (clearQueue(), setProgress(0), audioRef.current!.pause(), (audioRef.current!.src = ""));
    setState((s) => ({ ...s, isPlaying: false, duration: 0, current: null }));
  }, []);

  const seekForward = useCallback(() => (audioRef.current!.currentTime += 10), []);
  const seekBackward = useCallback(() => (audioRef.current!.currentTime -= 10), []);
  const seekTo = useCallback((time: number) => (audioRef.current!.currentTime = time), []);

  const jumpTo = useCallback((i: number) => (setState((_) => ({ ..._, duration: 0 })), setIndex(i)), []);
  const skip = useCallback(() => setIndex((i) => (i == _queue.current.length - 1 ? i : (setState((_) => ({ ..._, duration: 0 })), i + 1))), []);
  const prev = useCallback(() => setIndex((i) => (_progress.current > 10 || i === 0 ? (seekTo(0), i) : (setState((_) => ({ ..._, duration: 0 })), Math.max(0, i - 1)))), []);

  useEffect(() => void (_state.current = state), [state]);
  useEffect(() => void (_queue.current = queue), [queue]);
  useEffect(() => void (_progress.current = progress), [progress]);
  useEffect(() => void (_sleepTime.current = sleepTime), [sleepTime]);

  useEffect(() => {
    ctx.current = new AudioContext({ latencyHint: "interactive" });
    source.current = ctx.current.createMediaElementSource(audioRef.current!);

    EQ.current = EqNodes(ctx.current);
    CF.current = CrossFeed(ctx.current);

    (analyserLeft.current = ctx.current.createAnalyser()).fftSize = 2048;
    (analyserRight.current = ctx.current.createAnalyser()).fftSize = 2048;
    (analyserOverall.current = ctx.current.createAnalyser()).fftSize = 2048;

    (IG.current = ctx.current.createGain()).gain.value = dbToGain(initialInputGain.current);
    (PG.current = ctx.current.createGain()).gain.value = dbToGain(initialVolume.current);

    source.current.connect(IG.current);
    IG.current.connect(EQ.current.initialEQNode);

    EQ.current.finalEQNode.connect(CF.current.splitter);
    CF.current.merger.connect(PG.current);

    const splitter = ctx.current.createChannelSplitter(2);

    PG.current.connect(ctx.current.destination);
    PG.current.connect(analyserOverall.current);
    PG.current.connect(splitter);

    splitter.connect(analyserLeft.current, 0);
    splitter.connect(analyserRight.current, 1);
  }, []);

  useEffect(() => {
    navigator.mediaSession.setActionHandler("play", resume);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("nexttrack", skip);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
  }, []);

  useEffect(() => {
    IG.current!.gain.value = Math.pow(fx.IG / 100, 2);
    localStorage.setItem("IG", fx.IG.toString());
  }, [fx.IG]);

  useEffect(() => {
    PG.current!.gain.value = fx.mute ? 0 : Math.pow(fx.PG / 100, 2);
    localStorage.setItem("PG", fx.PG.toString());
  }, [fx.PG, fx.mute]);

  useEffect(() => {
    CF.current!.cross.left.gain.value = fx.CF / 100;
    CF.current!.cross.right.gain.value = fx.CF / 100;
    localStorage.setItem("CF", fx.CF.toString());
  }, [fx.CF]);

  useEffect(() => {
    safeAwait((async () => CF.current?.merger.disconnect())());
    safeAwait((async () => EQ.current?.finalEQNode.disconnect())());
    if (state.current?.channels !== 2) return void EQ.current!.finalEQNode.connect(PG.current!);
    EQ.current!.finalEQNode.connect(CF.current!.splitter);
    CF.current!.merger.connect(PG.current!);
  }, [state.current?.channels]);

  useEffect(() => {
    localStorage.setItem("EQ", JSON.stringify(fx.EQ));
    localStorage.setItem("EQenabled", fx.EQenabled.toString());
    EQ.current!.equalizerNodes.forEach((n, i) => (n.gain.value = fx.EQenabled ? fx.EQ[i]! : 0));
  }, [fx.EQ, fx.EQenabled]);

  useEffect(
    () =>
      audioRef.current!.addEventListener("timeupdate", () => {
        if (!_sleepTime.current) return;
        if (Date.now() < _sleepTime.current) return;
        (Date.now() - _sleepTime.current < 2000 && pause(), setSleepTime(0));
      }),
    [],
  );

  useEffect(() => setState((s) => ({ ...s, current: queue[index] || null })), [queue, index]);

  useEffect(() => {
    audioRef.current!.addEventListener("ended", () => (_state.current.loop ? resume() : skip()));
    audioRef.current!.addEventListener("play", () => setState((_) => ({ ..._, isPlaying: true })));
    audioRef.current!.addEventListener("pause", () => setState((_) => ({ ..._, isPlaying: false })));
    audioRef.current!.addEventListener("timeupdate", () => setProgress(Math.floor(audioRef.current!.currentTime || 0)));
    audioRef.current!.addEventListener("loadedmetadata", () => setState((_) => ({ ..._, duration: Math.floor(audioRef.current!.duration) })));
  }, []);

  useEffect(() => {
    audioRef.current!.src = "";
    if (!state.current?.path) return;
    window.api.transcode(state.current.path).then((res) => void (res && ((audioRef.current!.src = res), audioRef.current!.play())));
  }, [state.current?.path]);

  useEffect(() => setAnalyzer({ left: analyserLeft.current!, right: analyserRight.current!, overall: analyserOverall.current! }), []);

  useEffect(() => setMethods({ pause, resume, clearQueue, enqueue, seekForward, seekBackward, seekTo, jumpTo, skip, prev, destroy }), []);

  return <audio ref={audioRef} crossOrigin="anonymous" id="audio" />;
}
