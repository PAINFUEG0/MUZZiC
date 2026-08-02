/** @format */

import { analyzersNodes } from "./index";
import { useRef, useEffect, RefObject, useState } from "react";

const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export default function useVU() {
  const smoothedL = useRef(-60);
  const smoothedR = useRef(-60);
  const smoothedT = useRef(-60);
  const [analyser] = analyzersNodes.use();

  const [VUL, setVUL] = useState(0);
  const [VUR, setVUR] = useState(0);
  const [VUO, setVUO] = useState(0);

  useEffect(() => {
    if (!analyser.left || !analyser.right || !analyser.overall) return;

    const bufL = new Float32Array(analyser.left.fftSize);
    const bufR = new Float32Array(analyser.right.fftSize);
    const bufT = new Float32Array(analyser.overall.fftSize);

    const DBFS = (node: AnalyserNode, buf: Float32Array, smoothed: RefObject<number>) => {
      node.getFloatTimeDomainData(buf as any);

      let sumSq = 0;
      const attack = 0.9;
      const release = 0.2;
      for (let i = 0; i < buf.length; i++) sumSq += buf[i]! * buf[i]!;
      const db = 20 * Math.log10(Math.sqrt(sumSq / buf.length));
      const delta = Math.max(Number.isFinite(db) ? db : -60, -60) - smoothed.current;
      smoothed.current += delta * (delta > 0 ? attack : release);
      return smoothed.current;
    };

    let lastTick = 0;
    let rafId: number;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      if (now - lastTick < FRAME_INTERVAL) return;
      lastTick = now;

      setVUL(DBFS(analyser.left, bufL, smoothedL));
      setVUR(DBFS(analyser.right, bufR, smoothedR));
      setVUO(DBFS(analyser.overall, bufT, smoothedT));
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [analyser.left, analyser.right, analyser.overall]);

  return { VUL, VUR, VUO };
}
