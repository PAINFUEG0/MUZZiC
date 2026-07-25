/** @format */

import { analyzersNodes } from "../utils/stores";
import { useRef, useEffect, RefObject, useState } from "react";

export default function useVU() {
  const smoothedL = useRef(-60);
  const smoothedR = useRef(-60);
  const smoothedT = useRef(-60);
  const [analyser] = analyzersNodes.use();

  const [VUL, setVUL] = useState(0);
  const [VUR, setVUR] = useState(0);
  const [VUO, setVUO] = useState(0);

  useEffect(() => {
    const DBFS = (analyser: AnalyserNode, smoothed: RefObject<number>) => {
      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(dataArray);

      let sum = 0;
      const attack = 0.9;
      const release = 0.2;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i]! * dataArray[i]!;

      const rms = Math.sqrt(sum / bufferLength);
      const db = 20 * Math.log10(rms);

      const delta = Math.max(db ?? -60, -60) - smoothed.current;
      smoothed.current += delta * (delta > 0 ? attack : release);
      return smoothed.current;
    };

    const id = setInterval(() => {
      setVUL(DBFS(analyser.left, smoothedL));
      setVUR(DBFS(analyser.right, smoothedR));
      setVUO(DBFS(analyser.overall, smoothedT));
    }, 1000 / 120);

    return () => clearInterval(id);
  }, [analyser.overall]);

  return { VUL, VUR, VUO };
}
