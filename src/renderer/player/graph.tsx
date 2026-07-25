/** @format */

import { EqNodes } from "./equalizer";
import { CrossFeed } from "./crossfeed";
import { useEffect, useRef } from "react";
import { dbToGain } from "../../shared/helpers";
import { analyzersNodes, playerEffects } from "../utils/stores";

export function AudioGraph({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const ctx = useRef<AudioContext | null>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);

  const [, setAnalyzer] = analyzersNodes.use();
  const analyserLeft = useRef<AnalyserNode | null>(null);
  const analyserRight = useRef<AnalyserNode | null>(null);
  const analyserOverall = useRef<AnalyserNode | null>(null);

  const [FX] = playerEffects.use();
  const initialVolume = useRef(FX.volume);
  const PRE = useRef<GainNode | null>(null);
  const VOL = useRef<GainNode | null>(null);
  const initialInputGain = useRef(FX.inputGain);
  const EQ = useRef<ReturnType<typeof EqNodes> | null>(null);
  const CF = useRef<ReturnType<typeof CrossFeed> | null>(null);

  useEffect(() => {
    if (!PRE.current) return;
    void (PRE.current.gain.value = FX.inputGain);
    localStorage.setItem("inputGain", FX.inputGain.toString());
  }, [FX.inputGain]);

  useEffect(() => {
    if (!EQ.current) return;
    localStorage.setItem("gains", JSON.stringify(FX.gains));
    localStorage.setItem("equalizer", FX.equalizer.toString());
    EQ.current.equalizerNodes.forEach((n, i) => (n.gain.value = FX.equalizer ? FX.gains[i] : 0));
  }, [FX.equalizer, FX.gains]);

  useEffect(() => {
    if (!CF.current) return;
    CF.current.cross.left.gain.value = CF.current.cross.right.gain.value = FX.crossfeed ? 0.5 : 0;
  }, [FX.crossfeed]);

  useEffect(() => {
    if (!VOL.current) return;
    localStorage.setItem("volume", FX.volume.toString());
    VOL.current.gain.value = FX.muted ? 0 : Math.pow(FX.volume / 100, 2);
  }, [FX.volume, FX.muted]);

  useEffect(() => setAnalyzer({ left: analyserLeft.current!, right: analyserRight.current!, overall: analyserOverall.current! }), []);

  function initializeAudioGraph() {
    ctx.current = new AudioContext({ latencyHint: "interactive" });
    source.current = ctx.current.createMediaElementSource(audioRef.current!);

    EQ.current = EqNodes(ctx.current);
    CF.current = CrossFeed(ctx.current);

    (analyserLeft.current = ctx.current.createAnalyser()).fftSize = 2048;
    (analyserRight.current = ctx.current.createAnalyser()).fftSize = 2048;
    (analyserOverall.current = ctx.current.createAnalyser()).fftSize = 2048;

    (PRE.current = ctx.current.createGain()).gain.value = dbToGain(initialInputGain.current);
    (VOL.current = ctx.current.createGain()).gain.value = Math.pow(initialVolume.current / 100, 2);

    source.current.connect(PRE.current);
    PRE.current.connect(EQ.current.initialEQNode);
    EQ.current.finalEQNode.connect(CF.current.splitter);
    CF.current.merger.connect(VOL.current);

    const splitter = ctx.current.createChannelSplitter(2);

    VOL.current.connect(splitter);
    splitter.connect(analyserLeft.current, 0);
    splitter.connect(analyserRight.current, 1);

    VOL.current.connect(analyserOverall.current);
    analyserOverall.current.connect(ctx.current.destination);
  }

  return { initializeAudioGraph };
}
